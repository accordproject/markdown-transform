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

// A pure JavaScript SHA-256, so formula names need no Node `crypto` (or a
// browser polyfill for it) and are identical in every runtime.
import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils';

/**
 * Flatten an array of arrays
 */
export function flatten<T>(arr: T[][]): T[] {
    return arr.reduce<T[]>((acc, val) => acc.concat(val), []);
}

/**
 * Returns a unique chosen name for a formula
 */
export function formulaName(code: string): string {
    return 'formula_' + bytesToHex(sha256(utf8ToBytes(code)));
}
