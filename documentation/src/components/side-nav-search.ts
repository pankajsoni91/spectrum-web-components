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

import {
    LitElement,
    html,
    CSSResultArray,
    TemplateResult,
    property,
} from 'lit-element';
import sideNavSearchMenuStyles from './side-nav-search.css';
import lunr from 'lunr';
import { Search } from '../../../packages/search';
import {
    OverlayOpenDetail,
    OverlayCloseDetail,
} from '../../../packages/overlay-root';
import { AppRouter } from '../router';

const searchIndex = require('../../components/searchIndex.json');

export function nameToTitle(name: string): string {
    return name.replace(/((^|\-)(\w))/gm, (match, p1, p2, p3) => {
        let result = p3.toUpperCase();
        if (p2 === '-') {
            result = ` ${result}`;
        }
        return result;
    });
}

interface Result {
    name: string;
    url: string;
}

interface ResultGroup {
    name: string;
    results: Result[];
    maxScore: number;
}

class SearchComponent extends LitElement {
    private index: lunr.Index | undefined;

    public static get styles(): CSSResultArray {
        return [sideNavSearchMenuStyles];
    }

    @property({ type: Boolean, reflect: true })
    public open: boolean = false;

    @property({ type: Array })
    public results: ResultGroup[] = [];

    private popover?: HTMLElement | null;

    private handleSearchInput(event: InputEvent) {
        if (event.target) {
            const searchField = event.target as Search;
            this.updateSearchResults(searchField.value);
        }
    }

    private openPopover() {
        if (!this.popover) return;

        const overlayOpenDetail: OverlayOpenDetail = {
            content: this.popover,
            delay: 0,
            offset: 10,
            placement: 'bottom',
            trigger: this,
            interaction: 'click',
        };

        const overlayOpenEvent = new CustomEvent<OverlayOpenDetail>(
            'sp-overlay:open',
            {
                bubbles: true,
                composed: true,
                detail: overlayOpenDetail,
            }
        );

        this.dispatchEvent(overlayOpenEvent);
    }

    private closePopover() {
        if (!this.popover) return;

        const overlayCloseDetail: OverlayCloseDetail = {
            content: this.popover,
        };

        const overlayCloseEvent = new CustomEvent<OverlayCloseDetail>(
            'sp-overlay:close',
            {
                bubbles: true,
                composed: true,
                detail: overlayCloseDetail,
            }
        );

        this.dispatchEvent(overlayCloseEvent);
    }

    private updateSearchResults(value: string): void {
        if (!this.index || value.length < 3) {
            this.open = false;
            return;
        }

        const searchParam = `${value.trim()} ${value.trim()}*`;

        const collatedResults = new Map<
            string,
            {
                maxScore: number;
                results: Result[];
            }
        >();

        const search = this.index.search(searchParam);
        for (const item of search) {
            const match = /^\/([^/]+)\/([^/]+)/.exec(item.ref);
            if (!match) continue;

            const [, category, name] = match;
            if (!collatedResults.has(category)) {
                collatedResults.set(category, {
                    maxScore: 0,
                    results: [],
                });
            }
            const catagoryData = collatedResults.get(category);
            if (catagoryData) {
                catagoryData.maxScore = Math.max(
                    catagoryData.maxScore,
                    item.score
                );
                catagoryData.results.push({
                    name: nameToTitle(name),
                    url: item.ref,
                });
            }
        }

        const result: ResultGroup[] = [];
        for (const [name, { results, maxScore }] of collatedResults) {
            result.push({ name, results, maxScore });
        }
        result.sort((a, b) => {
            if (a.maxScore < b.maxScore) return 1;
            if (a.maxScore > b.maxScore) return -1;
            return 0;
        });
        this.results = result;

        this.openPopover();
    }

    firstUpdated(): void {
        this.index = lunr.Index.load(searchIndex);
        if (this.shadowRoot) {
            this.popover = this.shadowRoot.querySelector('sp-popover');
        }
    }

    renderResults(): TemplateResult {
        if (this.results.length > 0) {
            return html`
                <sp-menu>
                    ${this.results.map(
                        (category) => html`
                            <sp-menu-group>
                                <span slot="header">${category.name}</span>
                                ${category.results.map(
                                    (result) => html`
                                        <sp-menu-item
                                            @click=${() => {
                                                AppRouter.go(result.url);
                                                this.closePopover();
                                            }}
                                        >
                                            ${result.name}
                                        </sp-menu-item>
                                    `
                                )}
                            </sp-menu-group>
                        `
                    )}
                </sp-menu>
            `;
        } else {
            return html``;
        }
    }

    render(): TemplateResult {
        return html`
            <div id="search-container">
                <div id="search-field">
                    <sp-search
                        @input=${this.handleSearchInput}
                        @change=${this.handleSearchInput}
                    ></sp-search>
                </div>
                <sp-popover id="search-results-menu" open>
                    <style>
                        #search-results-menu {
                            width: 368px;
                            min-height: 220px;
                            max-height: calc(100vh - 200px);
                            margin-left: 24px;
                        }
                    </style>
                    ${this.renderResults()}
                </sp-popover>
            </div>
        `;
    }
}

customElements.define('docs-search', SearchComponent);
