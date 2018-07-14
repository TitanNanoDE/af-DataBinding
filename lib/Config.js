const CurrentConfig = {
    verboseLogging: false,
    logging: false,
};

export const enableVerboseLogging = function() {
    CurrentConfig.verboseLogging = true;
};

export const enableLogging = function() {
    CurrentConfig.logging = true;
};

export const useLogging = function() {
    return CurrentConfig.logging;
};

export const useVerboseLogging = function() {
    return CurrentConfig.verboseLogging;
};
