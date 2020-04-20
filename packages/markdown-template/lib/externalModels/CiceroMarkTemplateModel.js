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

const NS_PREFIX_CiceroMarkTemplateModel = 'org.accordproject.ciceromark.template' + '.';

const CiceroMarkTemplateModel = `
/*
 * Licensed under the Apache License, Version 2.0 (the &quot;License&quot;);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an &quot;AS IS&quot; BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

namespace org.accordproject.ciceromark.template

import org.accordproject.commonmark.Child from https://models.accordproject.org/markdown/commonmark.cto
import org.accordproject.commonmark.List from https://models.accordproject.org/markdown/commonmark.cto

/**
 * A model for Accord Project template extensions to commonmark
 */

abtract concept Variable extends Child {
    o String id
    o String type
    o String format optional
}

concept AtomicVariable extends Variable {
}

abstract concept Block extends Variable {
}

concept ConditionalBlock extends Variable {
    o String whenTrue
    o String whenFalse
}

abstract concept UnorderedListBlock extends Variable {
}

abstract concept OrderedListBlock extends Variable {
}

`;

module.exports = { NS_PREFIX_CiceroMarkTemplateModel, CiceroMarkTemplateModel };
