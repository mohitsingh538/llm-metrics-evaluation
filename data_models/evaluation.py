from typing import List, Dict
from pydantic import BaseModel


class Conversation(BaseModel):
    """
    Represents a conversation between a user and a bot.

    This class models a conversational exchange, containing the user's question
    and the bot's response. It provides a structured way to store and manage
    dialogues, facilitating their use in further processing or analysis.

    :ivar user_question: The question posed by the user during the conversation.
    :type user_question: str
    :ivar bot_response: The response provided by the bot to the user.
    :type bot_response: str
    """

    user_question: str
    bot_response: str



class EvaluationRequest(BaseModel):
    """
    Represents a request for an evaluation, encapsulating the models, metrics, context,
    and conversation data required for evaluation purposes.

    This class is intended for use in applications that process and evaluate conversational
    data. The attributes include information about models to evaluate, evaluation metrics,
    the context in which the evaluation occurs, and a structured conversation history.

    :ivar model: List of model identifiers to be evaluated.
    :type model: str
    :ivar metrics: List of metrics to be used for the evaluation.
    :type metrics: List[str]
    :ivar context: Context information describing the evaluation environment or scenario.
    :type context: str
    :ivar conversations: Conversation history, represented as a list of Conversation objects,
        containing the structured data of the conversational flow.
    :type conversations: List[Conversation]
    """

    model: str
    metrics: List[str]
    context: str
    conversations: List[Conversation]



class EvaluationResult(BaseModel):
    """
    Represents the result of an evaluation process.

    This class stores the scores and feedback for a particular evaluation. Scores
    are stored as key-value pairs where the keys are metrics or criteria being
    evaluated, and the values are the corresponding evaluation scores. Feedback
    provides additional information or comments about the evaluation outcome.

    :ivar scores: Dictionary containing evaluation metrics as keys and their
                  respective scores as values.
    :type scores: Dict[str, float]
    :ivar feedback: Feedback or comments about the evaluation results.
    :type feedback: str
    """

    scores: Dict[str, float]
    feedback: str

