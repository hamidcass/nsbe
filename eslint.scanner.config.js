/** ESLint config for accessibility code scanner. */
module.exports = {
  root: false,
  plugins: ["jsx-a11y"],
  extends: ["plugin:jsx-a11y/recommended"],
  rules: {
    "jsx-a11y/alt-text": "warn",
    "jsx-a11y/anchor-has-content": "warn",
    "jsx-a11y/aria-props": "warn",
    "jsx-a11y/aria-role": "warn",
    "jsx-a11y/heading-has-content": "warn",
    "jsx-a11y/html-has-lang": "warn",
    "jsx-a11y/iframe-has-title": "warn",
    "jsx-a11y/label-has-associated-control": "warn",
    "jsx-a11y/media-has-caption": "warn",
    "jsx-a11y/no-redundant-roles": "warn",
    "jsx-a11y/role-has-required-aria-props": "warn",
  },
};
