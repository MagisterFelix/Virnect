from rest_framework.views import exception_handler

from .utils import ExceptionUtils


def api_exception_handler(exception, context):
    response = exception_handler(exception, context)

    if response is None:
        return response

    if isinstance(response.data, list):
        payload = []

        for data in response.data:
            payload.append(ExceptionUtils.process_error(data))

        response.data = payload

        return response

    response.data = ExceptionUtils.process_error(response.data)

    return response
