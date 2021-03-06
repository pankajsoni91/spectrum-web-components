/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { html, CSSResultArray } from 'lit-element';
import './layout';
import { GuideDocs } from '../../guides';
import { LayoutElement } from './layout';
import componentStyles from './markdown.css';

class GuideElement extends LayoutElement {
    location?: {
        baseUrl: string;
        params: {
            guide: string;
        };
        pathname: string;
    };

    public static get styles(): CSSResultArray {
        return [super.styles, componentStyles];
    }

    public get componentName(): string {
        if (this.location) {
            return `sp-${this.location.params.guide}`;
        }
        return '';
    }

    renderContent() {
        let result;
        if (this.location && this.location.params) {
            result = html`
                <article class="spectrum-Typography">
                    ${GuideDocs.get(this.location.params.guide)}
                </article>
            `;
        }
        return result || super.renderContent();
    }
}
customElements.define('docs-guide', GuideElement);
