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

const dijkstra = require('dijkstrajs');
const find_path = dijkstra.find_path;

/**
 * Prune the graph for traversal
 * @param {object} graph the input graph
 * @returns {object} the raw graph for dijsktra
 */
function pruneGraph(graph) {
  const result = {};
  for (const sourceKey in graph) {
    result[sourceKey] = {};
    for (const targetKey in graph[sourceKey]) {
      // Don't forget to remove the meta data which really isn't part of the graph
      if (targetKey !== 'docs' && targetKey !== 'fileFormat') {
        result[sourceKey][targetKey] = 1;
      }
    }
  }
  return result;
}

/**
 * A generic transformation engine.
 *
 * The format for the graph is a map (a JavaScript object) where each entry is a format, i.e., vertex in the graph with the following content:
 *
 * [sourceFormat]: {
 *   docs: // A format description
 *   fileFormat: // What kind of format it is (i.e., utf8, json, binary)
 *   [targetFormat1]: async (input, parameters, options) => { ... return result }
 *   [targetFormat2]: async (input, parameters, options) => { ... return result }
 *   ...
 * }
 *
 * Each [targetFormat] entry defines an edge in the graph transforming [sourceFormat] to [targetFormat]
 */
class TransformEngine {
  /**
   * Construct the transformation engine
   * @param {object} transformationGraph - the transformation graph
   */
  constructor(transformationGraph) {
    // Clone the graph
    const {
      ...graph
    } = transformationGraph;
    this.transformationGraph = graph;
    this.refreshRawGraph();
  }

  /**
   * Converts the graph of transformations into a PlantUML text string
   * @returns {string} the PlantUML string
   */
  generateTransformationDiagram() {
    let result = `@startuml
hide empty description

`;
    const transformationGraph = this.getTransformationGraph();
    Object.keys(transformationGraph).forEach(src => {
      result += `${src} : \n`;
      result += `${src} : ${transformationGraph[src].docs}\n`;
      Object.keys(transformationGraph[src]).forEach(dest => {
        if (dest !== 'docs' && dest !== 'fileFormat') {
          result += `${src} --> ${dest}\n`;
        }
      });
      result += '\n';
    });
    result += '@enduml';
    return result;
  }

  /**
   * Transforms from a source format to a single destination format or
   * throws an exception if the transformation is not possible.
   *
   * @param {*} source the input for the transformation
   * @param {string} sourceFormat the input format
   * @param {string} destinationFormat the destination format
   * @param {object} parameters the transform parameters
   * @param {object} [options] the transform options
   * @param {boolean} [options.verbose] output verbose console logs
   * @returns {*} result of the transformation
   */
  async transformToDestination(source, sourceFormat, destinationFormat, parameters, options) {
    let result = source;
    const transformationGraph = this.getTransformationGraph();
    const path = find_path(this.rawGraph, sourceFormat, destinationFormat);
    for (let n = 0; n < path.length - 1; n++) {
      const src = path[n];
      const dest = path[n + 1];
      const srcNode = transformationGraph[src];
      const destinationNode = transformationGraph[dest];
      result = await srcNode[dest](result, parameters, options);
      if (options && options.verbose) {
        console.log(`Converted from ${src} to ${dest}. Result:`);
        if (destinationNode.fileFormat !== 'binary') {
          if (typeof result === 'object') {
            console.log(JSON.stringify(result, null, 2));
          } else {
            console.log(result);
          }
        } else {
          console.log(`<binary ${dest} data>`);
        }
      }
    }
    return result;
  }

  /**
   * Transforms from a source format to a list of destination formats, or
   * throws an exception if the transformation is not possible.
   *
   * @param {*} source the input for the transformation
   * @param {string} sourceFormat the input format
   * @param {string[]} destinationFormat the destination format as an array,
   * the transformation are applied in order to reach all formats in the array
   * @param {object} parameters the transform parameters
   * @param {object} [options] the transform options
   * @param {boolean} [options.verbose] output verbose console logs
   * @returns {Promise} result of the transformation
   */
  async transform(source, sourceFormat, destinationFormat, parameters, options) {
    let result = source;
    options = options ? options : {};
    parameters = parameters ? parameters : {};
    if (sourceFormat === 'markdown') {
      options.source = source;
    }
    let currentSourceFormat = sourceFormat;
    for (let i = 0; i < destinationFormat.length; i++) {
      let destination = destinationFormat[i];
      result = await this.transformToDestination(result, currentSourceFormat, destination, parameters, options);
      currentSourceFormat = destination;
    }
    return result;
  }

  /**
   * Return the format descriptor for a given format
   *
   * @param {string} format the format
   * @return {object} the descriptor for that format
   */
  formatDescriptor(format) {
    const transformationGraph = this.getTransformationGraph();
    if (Object.prototype.hasOwnProperty.call(transformationGraph, format)) {
      return transformationGraph[format];
    } else {
      throw new Error('Unknown format: ' + format);
    }
  }

  /**
   * Return the transformation graph
   *
   * @return {object} the transformation graph
   */
  getTransformationGraph() {
    return this.transformationGraph;
  }

  /**
   * Return all the available formats
   *
   * @return {object} the transformation graph
   */
  getAllFormats() {
    const transformationGraph = this.getTransformationGraph();
    return Object.keys(transformationGraph);
  }

  /**
   * Return all the available targets from a source formats
   *
   * @param {string} sourceFormat - the sourceFormat
   * @return {object} the transformation graph
   */
  getAllTargetFormats(sourceFormat) {
    const transformationGraph = this.getTransformationGraph();
    if (!transformationGraph[sourceFormat]) {
      throw new Error(`Unknown format: ${sourceFormat}`);
    }
    // eslint-disable-next-line no-unused-vars
    const {
      docs,
      fileFormat,
      ...targets
    } = transformationGraph[sourceFormat];
    return Object.keys(targets);
  }

  /**
   * Add a new format
   *
   * @param {string} sourceFormat - the name of the source format
   * @param {string} docs - the format description
   * @param {string} fileFormat - the format type (either 'json', 'utf8' or 'binary')
   */
  registerFormat(sourceFormat, docs, fileFormat) {
    const transformationGraph = this.getTransformationGraph();
    if (transformationGraph[sourceFormat]) {
      throw new Error(`Format already exists: ${sourceFormat}`);
    }
    transformationGraph[sourceFormat] = {
      docs,
      fileFormat
    };
  }

  /**
   * Add a new transform
   *
   * @param {string} sourceFormat - the name of the source format
   * @param {string} targetFormat - the name of the targetFormat format
   * @param {*} transform - the transform (an async function to transform from sourceFormat to targetFormat)
   */
  registerTransformation(sourceFormat, targetFormat, transform) {
    const transformationGraph = this.getTransformationGraph();
    if (!transformationGraph[sourceFormat]) {
      throw new Error(`Unknown format: ${sourceFormat}`);
    }
    if (!transformationGraph[targetFormat]) {
      throw new Error(`Unknown format: ${targetFormat}`);
    }
    transformationGraph[sourceFormat][targetFormat] = transform;
    // Rebuild the raw graph
    this.refreshRawGraph();
  }

  /**
   * Register a transform extension
   * @param {*} extension - the transform extension, including format and transforms
   */
  registerExtension(extension) {
    if (extension.format) {
      const {
        name: sourceFormat,
        docs,
        fileFormat
      } = extension.format;
      this.registerFormat(sourceFormat, docs, fileFormat);
    }
    if (extension.transforms) {
      for (let source in extension.transforms) {
        const transforms = extension.transforms[source];
        for (let target in transforms) {
          const transform = transforms[target];
          this.registerTransformation(source, target, transform);
        }
      }
    }
  }

  /**
   * Refresh raw graph
   * @private
   */
  refreshRawGraph() {
    this.rawGraph = pruneGraph(this.transformationGraph);
  }
}
module.exports = TransformEngine;