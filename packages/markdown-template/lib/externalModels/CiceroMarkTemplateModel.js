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
concept TextChunk extends Child {
    o String value
}

concept Variable extends Child {
    o String name
    o String type
    o String format optional
    o String[] value optional // XXX to fix, used in enums
}

concept ComputedVariable extends Variable {
}

concept Block extends Child {
    o String name
}

concept ClauseBlock extends Block {
    o String type
    o String id
}

concept ContractBlock extends Block {
    o String type
    o String id
}

concept WithBlock extends Block {
    o String type
}

concept ConditionalBlock extends Block {
    o String whenTrue
    o String whenFalse
}

concept UnorderedListBlock extends Block {
    o String type
}

concept OrderedListBlock extends Block {
    o String type
}
`;

module.exports = { NS_PREFIX_CiceroMarkTemplateModel, CiceroMarkTemplateModel };
