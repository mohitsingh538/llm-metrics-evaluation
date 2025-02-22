import asyncio
import json
import os
from collections import defaultdict
from typing import Self, Dict, Any, List
from langchain.schema import HumanMessage
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate
from langchain_core.messages.ai import AIMessage
from langchain_core.output_parsers.json import JsonOutputParser
from langchain_core.language_models.chat_models import BaseChatModel
from data_models.evaluation import EvaluationRequest, EvaluationResult, Conversation
from utils.logs import setup_logger


load_dotenv()

logger = setup_logger("evaluation")



def get_model(model_name: str, model_params: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Creates and returns a dictionary containing a chat model and an embedding model. The chat model
    is selected based on the provided `model_name` and can be derived from supported APIs such as
    OpenAI's GPT, Gemini, or Groq. The embedding model uses Google Generative AI embeddings.

    If specific parameters for the model are not provided, default parameter values are used
    to configure the model. The method also dynamically sets environment variables if they
    are missing, ensuring proper API authentication.

    :param model_name: The name of the model to be configured. Must start with identifiers like
        "gpt", "gemini", or "groq" to specify the type of model.
    :type model_name: str
    :param model_params: Optional dictionary containing specific configuration settings for the model.
        Settings such as `temperature`, `max_tokens`, and `timeout` can be defined here.
    :type model_params: Dict[str, Any], optional
    :return: A dictionary containing the configured chat model and embedding instance. Dictionary keys
        include "chat" for the chat model and "embeddings" for the embedding model instance.
    :rtype: Dict[str, Any
    """

    from langchain_google_genai import GoogleGenerativeAIEmbeddings

    if "GOOGLE_API_KEY" not in os.environ:
        os.environ["GOOGLE_API_KEY"] = os.environ.get("GEMINI_API_KEY")

    embedding = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
    if not model_params:
        model_params = {
            "temperature": 0.0,
            "max_tokens": 512,
            "top_p": 1.0,
            "timeout": 1000,
            "stream": False,
            "max_retries": 3,
        }

    #   GPT models
    if model_name.startswith("gpt"):
        from langchain_community.chat_models import ChatOpenAI

        if "OPENAI_API_KEY" not in os.environ:
            os.environ["OPENAI_API_KEY"] = os.environ.get("OPENAI_API_KEY")

        chat = ChatOpenAI(model=model_name, **model_params)

    #   Gemini models
    elif model_name.startswith("gemini"):
        from langchain_google_genai.chat_models import ChatGoogleGenerativeAI

        chat = ChatGoogleGenerativeAI(model=model_name, **model_params)

    #   Groq models
    elif model_name.startswith("groq"):
        from langchain_groq import ChatGroq

        model_name = model_name.replace("groq-", "")

        if "GROQ_API_KEY" not in os.environ:
            os.environ["GROQ_API_KEY"] = os.environ.get("GROQ_API_KEY")

        model_params.pop("stream", None)
        model_params.pop("top_p", None)

        chat = ChatGroq(model=model_name, **model_params)

    else:
        raise ValueError("Unsupported model")

    return {
        "chat": chat,
        "embeddings": embedding
    }


async def llm_response(llm: BaseChatModel, prompt: PromptTemplate) -> AIMessage:
    """
    Generate a response using a language model (LLM) based on the provided prompt. Also, if a user ID is provided,
    update the token consumption count for that user in Redis.

    The function communicates with the specified language model to produce an AI-generated message.
    The prompt provided guides the message generation process. Additionally, if a user ID is supplied,
    the function logs the token usage of the response in a Redis store for tracking daily quota consumption.

    :param llm: Language model to be used for generating responses.
    :type llm: BaseChatModel
    :param prompt: Template containing the content to guide the AI model's response.
    :type prompt: PromptTemplate
    :return: AI-generated message from the LLM.
    :rtype: AIMessage
    """

    response = await llm.ainvoke(input=[HumanMessage(content=prompt)])
    logger.info(f"LLM Prompt ==> {prompt}\n\nLLM Response: {response.content}")

    return response




class BotResponseGenerator:

    def __init__(self, chat_model: BaseChatModel) -> None:
        self.llm = chat_model

    async def get_response(self, user_question: str, context: str) -> AIMessage:
        """
        Retrieves an AI-generated response based on a user's question and context.

        This method uses a specified context and question prompt to generate an AI
        response. The optional `user_id` is used to track or enhance the response
        for a particular user. The method formats the input into a suitable prompt
        and retrieves the response asynchronously through the defined language model
        (LLM). The final result is returned as an instance of `AIMessage`.

        :param user_question: The question posed by the user for the AI to answer.
        :param context: The contextual information relevant to answering the user's question.
        :return: An AIMessage containing the response generated by the LLM based on the user's question and context.
        :rtype: AIMessage
        """

        prompt_template = PromptTemplate(
            template="""
            Given the following context, answer the user’s question:
            Context: {context}
            User Question: {user_question}
            """,
            input_variables=["context", "user_question"]
        )
        prompt = prompt_template.format(context=context, user_question=user_question)

        return await llm_response(self.llm, prompt)



class Evaluator:

    parser = JsonOutputParser(pydantic_object=EvaluationResult)

    def __init__(self, chat_model: BaseChatModel) -> Self:
        self.llm = chat_model

    async def _evaluate(self, conversation: Conversation, context: str, metrics: List[str]) -> EvaluationResult:
        """
        Asynchronously evaluates the conversation using a provided context and metrics,
        and returns the evaluation result. The function generates a prompt based on the
        conversation, context, and metrics, obtains a response from the LLM, and parses
        the response to produce the evaluation result.

        :param conversation: The conversation containing the user's input
            and the bot's response.
        :type conversation: Conversation
        :param context: The specific context in which the evaluation is
            being conducted.
        :type context: str
        :param metrics: A list of metrics to guide the evaluation,
            specifying evaluation criteria.
        :type metrics: List[str]
        :return: The parsed evaluation result derived from the LLM's
            response to the prompt.
        :rtype: EvaluationResult
        """

        prompt = self._generate_prompt(conversation, context, metrics)
        response = await llm_response(self.llm, prompt)
        logger.info(f"Raw Evaluation Result for {conversation.bot_response} ==> {response}")

        return self._parse_response(response)

    async def evaluate_conversation(self, request: EvaluationRequest) -> Dict[str, List[Dict[str, Any]]]:
        """
        Evaluates a set of conversations asynchronously and calculates average scores for
        each evaluation metric across all conversations. The function processes evaluation
        for each conversation provided in the request, gathers all results, and aggregates
        scores per defined metrics.

        :param request: The evaluation request containing conversations, context,
                        and metrics to be used for evaluation.
        :type request: EvaluationRequest
        :return: A dictionary containing the results of evaluation for each conversation
                 and the average scores for each metric across all conversations.
        :rtype: dict
        """

        total_scores = defaultdict(int)
        num_entries = len(request.conversations)

        # Run evaluation for all conversations asynchronously
        tasks = [
            self._evaluate(conversation, request.context, request.metrics)
            for conversation in request.conversations
        ]
        results = await asyncio.gather(*tasks)

        formatted_conversations = []

        for conversation, result in zip(request.conversations, results):
            # Format conversation messages for chat-ui-kit-react
            formatted_conversations.extend([
                {"text": conversation.user_question, "sender": "user"},
                {
                    "text": conversation.bot_response,
                    "sender": "bot",
                    "evaluation": result.model_dump()
                },
            ])

            for metric, score in result.scores.items():
                total_scores[metric] += score

        avg_scores = {metric: total / num_entries for metric, total in total_scores.items()}
        avg_scores = {key: value for key, value in avg_scores.items() if key in request.metrics}

        return {
            "average_scores": avg_scores,
            "conversations": formatted_conversations  # Structured conversation data for the chat UI
        }

    @classmethod
    def _generate_prompt(cls, conversation: Conversation, context: str, metrics: List[str]) -> str:
        """
        Generates a prompt string designed for evaluating a bot response. It utilizes a
        template with input and partial variables, and dynamically formats the template
        content to include specific conversational details for evaluation purposes.

        :param conversation: An instance of the `Conversation` class containing
            information about the ongoing interaction, such as user question and
            bot response.
        :param context: A string containing the context or preamble for the conversation,
            used to provide relevant background information for evaluation.
        :param metrics: List of metric names as strings that specify the criteria
            against which the bot's response is evaluated.
        :return: A formatted string that combines the provided conversation details,
            context, and evaluation metrics, following a predefined prompt template.
        :rtype: str
        """

        template = PromptTemplate(
            template="""
            Evaluate the following bot response:
            {format_instructions}
            Context: {context}
            User Question: {user_question}
            Bot Answer: {bot_answer}
            Metrics: {metrics}

            ** You need to score the bot response out of 10. **
            """,
            input_variables=["context", "user_question", "bot_answer", "metrics"],
            partial_variables={"format_instructions": cls.parser.get_format_instructions()},
        )

        return template.format(
            context=context,
            user_question=conversation.user_question,
            bot_answer=conversation.bot_response,
            metrics=json.dumps(metrics)
        )

    @classmethod
    def _parse_response(cls, response: AIMessage) -> EvaluationResult:
        """
        Parses the AI message response to extract evaluation results, which include
        evaluation scores and feedback. Handles potential response format inconsistencies
        or parsing errors. On parsing failure, returns default evaluation results with
        an error message as feedback.

        :param response: The AIMessage object containing the response content to be
            parsed.
        :type response: AIMessage
        :return: An EvaluationResult object with extracted scores and feedback.
            If an error occurs during parsing, returns an EvaluationResult with
            default values.
        :rtype: EvaluationResult
        """

        try:
            data = cls.parser.parse(response.content)
            if not isinstance(data, dict):
                data = json.loads(data)

            logger.info(f"Formatted Evaluation Result ==> {data}")
            return EvaluationResult(
                scores=data.get("scores", {}),
                feedback=data.get("feedback", "No feedback provided.")
            )

        except (json.JSONDecodeError, TypeError) as e:
            logger.error(f"Error parsing Evaluation response: {str(e)}")
            return EvaluationResult(
                scores={},
                feedback=f"Invalid response format: {str(e)}"
            )
