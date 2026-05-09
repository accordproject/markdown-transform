/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const TransformEngine = require('./transformEngine');
const builtinTransformationGraph = require('./builtinTransforms');

/**
 * Create a new transformation engine
 *
 * @param {object} transformationGraph - initial transformation graph
 * @return {TransformEngine} the transformation engine
 */
function createTransformationEngine(transformationGraph) {
    return new TransformEngine(transformationGraph);
}

module.exports.createTransformationEngine;

/**
 * This is instantiated here for backward compatibility
 * @type {TransformEngine}
 */
const builtinEngine = createTransformationEngine(builtinTransformationGraph);

module.exports.builtinEngine = builtinEngine;

/**
 * Return the format descriptor for a given format
 * @param {string} format the format
 * @returns {object} the descriptor for that format
 */
module.exports.formatDescriptor = (format) => builtinEngine.formatDescriptor(format);

/**
 * Transforms from a source format to a list of destination formats.
 * @param {object|string} source the input for the transformation
 * @param {string} sourceFormat the input format
 * @param {string[]} destinationFormat the destination format as an array
 * @param {object} parameters the transform parameters
 * @param {object} [options] the transform options
 * @returns {Promise<object|string>} result of the transformation
 */
module.exports.transform = (
    source,
    sourceFormat,
    destinationFormat,
    parameters,
    options
) => builtinEngine.transform(source, sourceFormat, destinationFormat, parameters, options);

/**
 * Converts the transformation graph into a PlantUML diagram string
 * @returns {string} the PlantUML string
 */
module.exports.generateTransformationDiagram = () => builtinEngine.generateTransformationDiagram();
