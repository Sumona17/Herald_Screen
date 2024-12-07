export const generateRules = ({ required = false, minLength, maxLength, fieldLabel }) => {
  const rules = [];

  if (required) {
    rules.push({ required: true, message: `Please provide ${fieldLabel}!` });
  }

  if (minLength !== undefined) {
    rules.push({
      min: minLength,
      message: `${fieldLabel} must be at least ${minLength} characters long!`
    });
  }

  if (maxLength !== undefined) {
    rules.push({
      max: maxLength,
      message: `${fieldLabel} cannot exceed ${maxLength} characters!`
    });
  }

  return rules;
};
