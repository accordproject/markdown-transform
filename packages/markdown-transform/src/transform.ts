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

import { TransformEngine, TransformationGraph } from './transformEngine';
import builtinTransformationGraph from './builtinTransforms';

/**
 * Create a new transformation engine
 */
export function createTransformationEngine(transformationGraph: TransformationGraph): TransformEngine {
    return new TransformEngine(transformationGraph);
}

/**
 * Backwards-compatible singleton engine for the builtin transformation graph.
 */
export const builtinEngine = createTransformationEngine(builtinTransformationGraph);

/**
 * Return the format descriptor for a given format
 */
export const formatDescriptor = (format: string) => builtinEngine.formatDescriptor(format);

/**
 * Transforms from a source format to a list of destination formats.
 */
export const transform = (
    source: any,
    sourceFormat: string,
    destinationFormat: string[],
    parameters?: any,
    options?: any,
) => builtinEngine.transform(source, sourceFormat, destinationFormat, parameters, options);

/**
 * Converts the transformation graph into a PlantUML diagram string
 */
export const generateTransformationDiagram = () => builtinEngine.generateTransformationDiagram();
