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

const NS_PREFIX_TemplateMarkRawModel = 'org.accordproject.templatemark.raw' + '.';

const TemplateMarkRawModel = `
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

namespace org.accordproject.templatemark.raw

import org.accordproject.commonmark.Child from https://js-new-ciceromark--accordproject-models.netlify.app/markdown/commonmark@0.2.0.cto

/**
 * A model for Accord Project template extensions to commonmark
 */
concept TextChunk extends Child {
    o String value
}
`;

module.exports = { NS_PREFIX_TemplateMarkRawModel, TemplateMarkRawModel };
