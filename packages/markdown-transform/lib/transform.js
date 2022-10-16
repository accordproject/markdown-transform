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
 * @return {*} the transformation engine
 */
function createTransformationEngine(transformationGraph) {
  return new TransformEngine(transformationGraph);
}
module.exports.createTransformationEngine;

/**
 * This is instantiated here for backward compatibility
 */
const builtinEngine = createTransformationEngine(builtinTransformationGraph);
module.exports.builtinEngine = builtinEngine;
module.exports.formatDescriptor = format => builtinEngine.formatDescriptor(format);
module.exports.transform = (source, sourceFormat, destinationFormat, parameters, options) => builtinEngine.transform(source, sourceFormat, destinationFormat, parameters, options);
module.exports.generateTransformationDiagram = () => builtinEngine.generateTransformationDiagram();