from rest_framework.views import exception_handler


def api_exception_handler(exception, context):
    response = exception_handler(exception, context)

    if response is None:
        return response

    payload = {
        "details": []
    }

    for field, errors in response.data.items():
        payload["details"].append({field: " ".join(errors) if isinstance(errors, list) else errors})

    response.data = payload

    return response
