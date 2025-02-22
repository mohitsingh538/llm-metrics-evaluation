import logging
import logging.config
import os
import time
from typing import Dict, Any
from pythonjsonlogger import jsonlogger



class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """
    Custom JSON formatter for logging.

    Adds additional fields to the log record.
    """

    def add_fields(self, log_record: Dict[str, Any],
                   record: logging.LogRecord,
                   message_dict: Dict[str, Any]) -> None:
        """
        Add custom fields to the log record.

        Args:
            log_record (dict): The log record to which custom fields are added.
            record (logging.LogRecord): The original log record.
            message_dict (dict): The dictionary containing the log message.
        """
        super().add_fields(log_record, record, message_dict)
        log_record.update({
            "timestamp": int(time.time() * 1000),
            "service.name": "llm_evaluation",
            "log.level": record.levelname,
            "message": record.getMessage(),
            "function": record.funcName
        })


def setup_logger(name: str = None, log_level: str = "INFO", log_file: str = None):
    """
    Configures and sets up a logger for the application with specified logging level and
    output file. It ensures the logger is uniquely identified by name and writes logs
    simultaneously to the console (limited to error level and above) and a file in JSON
    format. The file handler will have a logging level based on the input provided.

    If no name is provided, it defaults to the name of the script being executed. If no
    log_file is specified, a default directory 'logs/' will be used and the file will be
    named according to the logger name with a `.log` extension.

    :param name: The name of the logger instance. Defaults to the script's basename
                 (without extension) if no name is provided.
    :type name: str, optional
    :param log_level: The desired logging level for the logger. Defaults to "INFO".
                      Accepted values include standard logging levels like "DEBUG", "INFO",
                      "WARNING", "ERROR", and "CRITICAL".
    :type log_level: str
    :param log_file: The file where logs will be saved. When not specified, the logs will
                     be saved as `logs/{logger_name}.log`.
    :type log_file: str, optional
    :return: A configured logger instance with the specified name, log level, file, and
             handlers.
    :rtype: logging.Logger
    """

    if not name:
        name = os.path.splitext(os.path.basename(__file__))[0]  # Default to script name

    if not log_file:
        log_file = f"logs/{name}.log"

    os.makedirs(os.path.dirname(log_file), exist_ok=True)

    logger = logging.getLogger(name)

    # Avoid adding multiple handlers if the logger is already configured
    if logger.hasHandlers():
        return logger

    logger.setLevel(log_level)

    # Create JSON formatter
    formatter = CustomJsonFormatter()

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel("ERROR")
    console_handler.setFormatter(formatter)

    # File handler
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(log_level)
    file_handler.setFormatter(formatter)

    # Add handlers to logger
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger
