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

export const NAMESPACE = 'org.accordproject.ciceromark@0.6.0';

export const MODEL = `
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
concerto version "^3.0.0"
namespace org.accordproject.ciceromark@0.6.0

import org.accordproject.commonmark@0.5.0.Child from https://models.accordproject.org/markdown/commonmark@0.5.0.cto
import concerto.metamodel@1.0.0.Decorator from https://models.accordproject.org/concerto/metamodel@1.0.0.cto

/**
 * A model for Accord Project extensions to commonmark
 */

abstract concept Element extends Child {
  o String name
  o String elementType optional
  o Decorator[] decorators optional
}

concept Variable extends Element {
  o String value
  o String identifiedBy optional
}

concept FormattedVariable extends Variable {
  o String format
}

concept EnumVariable extends Variable {
  o String[] enumValues
}

concept Formula extends Element {
  o String value
  o String[] dependencies optional
  o String code optional
}

abstract concept Block extends Element {
}

concept Clause extends Block {
  o String src optional
}

concept Contract extends Block {
  o String src optional
}

concept Conditional extends Block {
  o Boolean isTrue
  o Child[] whenTrue
  o Child[] whenFalse
}

concept Optional extends Block {
  o Boolean hasSome
  o Child[] whenSome
  o Child[] whenNone
}

concept ListBlock extends Block {
    o String type
    o String tight
    o String start optional
    o String delimiter optional
}

`;

export default { NAMESPACE, MODEL };
