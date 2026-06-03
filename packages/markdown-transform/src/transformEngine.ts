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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dijkstra = require('dijkstrajs');
const find_path = dijkstra.find_path;

export interface FormatNode {
    docs?: string;
    fileFormat?: string;
    [targetFormat: string]: any;
}

export type TransformationGraph = Record<string, FormatNode>;

/**
 * Prune the graph for traversal
 */
function pruneGraph(graph: TransformationGraph): Record<string, Record<string, number>> {
    const result: Record<string, Record<string, number>> = {};
    for (const sourceKey in graph) {
        result[sourceKey] = {};
        for (const targetKey in graph[sourceKey]) {
            if (targetKey !== 'docs' && targetKey !== 'fileFormat') {
                result[sourceKey][targetKey] = 1;
            }
        }
    }
    return result;
}

/**
 * A generic transformation engine.
 */
export class TransformEngine {
    transformationGraph: TransformationGraph;
    rawGraph: Record<string, Record<string, number>>;

    constructor(transformationGraph: TransformationGraph) {
        const { ...graph } = transformationGraph;
        this.transformationGraph = graph;
        this.rawGraph = {};
        this.refreshRawGraph();
    }

    /**
     * Converts the graph of transformations into a PlantUML text string
     */
    generateTransformationDiagram(): string {
        let result = `@startuml
hide empty description

`;
        const transformationGraph = this.getTransformationGraph();
        Object.keys(transformationGraph).forEach((src) => {
            result += `${src} : \n`;
            result += `${src} : ${transformationGraph[src].docs}\n`;
            Object.keys(transformationGraph[src]).forEach((dest) => {
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
     * Transforms from a source format to a single destination format
     */
    async transformToDestination(
        source: any,
        sourceFormat: string,
        destinationFormat: string,
        parameters?: any,
        options?: { verbose?: boolean },
    ): Promise<any> {
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
     * Transforms from a source format to a list of destination formats
     */
    async transform(
        source: any,
        sourceFormat: string,
        destinationFormat: string[],
        parameters?: any,
        options?: { verbose?: boolean; source?: any },
    ): Promise<any> {
        let result = source;
        options = options ? options : {};
        parameters = parameters ? parameters : {};
        if (sourceFormat === 'markdown') {
            options.source = source;
        }

        let currentSourceFormat = sourceFormat;

        for (let i = 0; i < destinationFormat.length; i++) {
            const destination = destinationFormat[i];
            result = await this.transformToDestination(result, currentSourceFormat, destination, parameters, options);
            currentSourceFormat = destination;
        }
        return result;
    }

    /**
     * Return the format descriptor for a given format
     */
    formatDescriptor(format: string): FormatNode {
        const transformationGraph = this.getTransformationGraph();
        if (Object.prototype.hasOwnProperty.call(transformationGraph, format)) {
            return transformationGraph[format];
        } else {
            throw new Error('Unknown format: ' + format);
        }
    }

    getTransformationGraph(): TransformationGraph {
        return this.transformationGraph;
    }

    getAllFormats(): string[] {
        return Object.keys(this.getTransformationGraph());
    }

    getAllTargetFormats(sourceFormat: string): string[] {
        const transformationGraph = this.getTransformationGraph();
        if (!transformationGraph[sourceFormat]) {
            throw new Error(`Unknown format: ${sourceFormat}`);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { docs, fileFormat, ...targets } = transformationGraph[sourceFormat];
        return Object.keys(targets);
    }

    registerFormat(sourceFormat: string, docs: string, fileFormat: string): void {
        const transformationGraph = this.getTransformationGraph();
        if (transformationGraph[sourceFormat]) {
            throw new Error(`Format already exists: ${sourceFormat}`);
        }
        transformationGraph[sourceFormat] = { docs, fileFormat };
    }

    registerTransformation(sourceFormat: string, targetFormat: string, transform: any): void {
        const transformationGraph = this.getTransformationGraph();
        if (!transformationGraph[sourceFormat]) {
            throw new Error(`Unknown format: ${sourceFormat}`);
        }
        if (!transformationGraph[targetFormat]) {
            throw new Error(`Unknown format: ${targetFormat}`);
        }
        transformationGraph[sourceFormat][targetFormat] = transform;
        this.refreshRawGraph();
    }

    registerExtension(extension: any): void {
        if (extension.format) {
            const { name: sourceFormat, docs, fileFormat } = extension.format;
            this.registerFormat(sourceFormat, docs, fileFormat);
        }
        if (extension.transforms) {
            for (const source in extension.transforms) {
                const transforms = extension.transforms[source];
                for (const target in transforms) {
                    const transform = transforms[target];
                    this.registerTransformation(source, target, transform);
                }
            }
        }
    }

    private refreshRawGraph(): void {
        this.rawGraph = pruneGraph(this.transformationGraph);
    }
}

export default TransformEngine;
