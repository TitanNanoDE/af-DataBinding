const gulp = require('gulp');

const compileTemplates = function() {
    return import('../../gulp').then(({ stripTemplates }) => {
        return gulp.src('example-template/template.original.html')
            .pipe(stripTemplates())
            .pipe(gulp.dest('dist/'));
    });
};

exports.default = compileTemplates;
