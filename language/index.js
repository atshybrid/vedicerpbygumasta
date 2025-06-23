const i18n = require("i18n");

const allowedLocales = ["en"];

// Configure i18n
i18n.configure({
  locales: allowedLocales, // Supported locales
  directory: __dirname + "/locales", // Directory containing language files
  defaultLocale: "en", // Default locale
  objectNotation: true, // Use object notation for translation strings
  // Optionally, you can set other configuration options here
});

const setLocale = (locale) => {
  if (!allowedLocales.includes(locale)) {
    locale = "en";
  }
  i18n.setLocale(locale);
};

// Set the current locale
setLocale("en");

module.exports = {
  getText: i18n.__,
  setLocale,
};
