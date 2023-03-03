const handleErrors = (validation, errors, setFieldError, setNonFieldError) => {
  Array.from(errors).forEach(
    (obj) => Object.entries(obj).forEach(
      (entry) => {
        const [field, msg] = entry;
        if (field in validation) {
          setFieldError(field, { message: msg });
        } else {
          setNonFieldError(msg);
        }
      },
    ),
  );
};

export default handleErrors;
