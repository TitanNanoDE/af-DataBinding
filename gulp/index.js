/* eslint-env node */

import through from 'through2';
import PluginError from 'plugin-error';
import Path from 'path';
import TreeStripper from '../lib/TreeStripper';
import Vinyl from 'vinyl';

// Consts
const PLUGIN_NAME = '@af-modules/DataBinding';

TreeStripper.init();

// Plugin level function(dealing with files)
const stripTemplates = function({ postfix = '', bindingsExtension = '.js' } = {}) {
    return through.obj(function(file, enc, cb) {
        if (file.isNull()) {
            // return empty file
            return cb(null, file);
        }

        const fileName = Path.parse(file.path);
        const newTemplateName = `${fileName.name}${postfix}`;
        const { template, bindings } = TreeStripper.stripFile(file.contents.toString());

        const bindingsFile = new Vinyl({
            cwd: file.cwd,
            base: file.base,
            path: `${fileName.dir}/${newTemplateName}.bindings.${bindingsExtension}`,
            contents: new Buffer(bindings),
        });

        this.push(bindingsFile);

        file.path = `${fileName.dir}/${newTemplateName}${fileName.ext}`;

        if (file.isBuffer()) {
            file.contents = new Buffer(template);
        }

        if (file.isStream()) {
            throw new PluginError(PLUGIN_NAME, 'unable to process streams');
        }

        cb(null, file);
    });
};

export { stripTemplates };
