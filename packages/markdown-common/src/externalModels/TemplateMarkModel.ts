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

export const NAMESPACE = 'org.accordproject.templatemark@0.5.0';

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
namespace org.accordproject.templatemark@0.5.0

import org.accordproject.commonmark@0.5.0.Child from https://models.accordproject.org/markdown/commonmark@0.5.0.cto
import concerto.metamodel@1.0.0.Decorator from https://models.accordproject.org/concerto/metamodel@1.0.0.cto

/**
 * A model for Accord Project template extensions to commonmark
 */

/**
 * Identifiers for code strings in Formula Definition nodes
 */
enum CodeType {
  o TYPESCRIPT
  o ES_2020
}

/**
 * User provided code, along with a code language identifier
 */
concept Code {
  o CodeType type
  o String contents
}

abstract concept ElementDefinition extends Child {
  o String name
  o String elementType optional
  o Decorator[] decorators optional
}

concept VariableDefinition extends ElementDefinition {
  o String identifiedBy optional
}

concept FormattedVariableDefinition extends VariableDefinition {
  o String format
}

concept EnumVariableDefinition extends VariableDefinition {
  o String[] enumValues
}

concept FormulaDefinition extends ElementDefinition {
  o String[] dependencies optional // name of variables on which the formula depends
  o Code code
}

abstract concept BlockDefinition extends ElementDefinition {
}

concept ClauseDefinition extends BlockDefinition {
    o Code condition optional
}

concept ContractDefinition extends BlockDefinition {
}

concept WithDefinition extends BlockDefinition {
}

concept ConditionalDefinition extends BlockDefinition {
    o Child[] whenTrue
    o Child[] whenFalse
    o Code condition optional
    o String[] dependencies optional
}

concept OptionalDefinition extends BlockDefinition {
    o Child[] whenSome
    o Child[] whenNone
}
concept JoinDefinition extends BlockDefinition {
    // if separator is set, we just use that
    o String separator optional
    // if separator is not set, we use the Intl.ListFormat, paramaterized by locale, type and style
    o String locale optional
    o String type optional
    o String style optional
}

concept ListBlockDefinition extends BlockDefinition {
    o String type
    o String tight
    o String start optional
    o String delimiter optional
}

concept ForeachBlockDefinition extends BlockDefinition {
}

concept WithBlockDefinition extends BlockDefinition {
}

concept ConditionalBlockDefinition extends BlockDefinition {
    o Child[] whenTrue
    o Child[] whenFalse
    o Code condition optional
}

concept OptionalBlockDefinition extends BlockDefinition {
    o Child[] whenSome
    o Child[] whenNone
}

`;

export default { NAMESPACE, MODEL };
