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
import { ComponentDocs } from '../../components';
import { AppRouter } from '../router';
import { SidenavSelectDetail } from '../../../packages/sidenav';
import { Search } from '../../../packages/search';
import sideNavStyles from './side-nav.css';
import sideNavSearchMenuStyles from './side-nav-search-menu.css';
import lunr from 'lunr';
import './adobe-logo';

const searchIndex = require('../../components/searchIndex.json');

function nameToTitle(name: string): string {
    return name.replace(/((^|\-)(\w))/gm, (match, p1, p2, p3) => {
        let result = p3.toUpperCase();
        if (p2 === '-') {
            result = ` ${result}`;
        }
        return result;
    });
}

class SideNav extends LitElement {
    public static get styles(): CSSResultArray {
        return [sideNavStyles];
    }

    private get components(): string[] {
        return Array.from(ComponentDocs.keys());
    }

    private handleSelect(
        event: CustomEvent<SidenavSelectDetail>,
        kind: 'guides' | 'components'
    ): void {
        const path = AppRouter.urlForPath(`/${kind}/${event.detail.value}`);
        AppRouter.go(path);
    }

    private handleComponentSelect(
        event: CustomEvent<SidenavSelectDetail>
    ): void {
        this.handleSelect(event, 'components');
    }

    private handleGuideSelect(event: CustomEvent<SidenavSelectDetail>): void {
        this.handleSelect(event, 'guides');
    }

    render(): TemplateResult {
        return html`
            <div id="nav-header">
                <div id="logo-container">
                    <a href="/">
                        <docs-spectrum-logo></docs-spectrum-logo>
                        <div id="header-title">
                            Spectrum
                            <br />
                            Web Components
                        </div>
                    </a>
                </div>
                <docs-search></docs-search>
            </div>
            <div id="navigation">
                <sp-sidenav variant="multilevel">
                    <sp-sidenav-item
                        label="Components"
                        value="components"
                        @sidenav-select=${this.handleComponentSelect}
                    >
                        ${this.components.map(
                            (name) =>
                                html`
                                    <sp-sidenav-item
                                        value="${name}"
                                        label="${nameToTitle(name)}"
                                    ></sp-sidenav-item>
                                `
                        )}
                    </sp-sidenav-item>
                    <sp-sidenav-item
                        label="Contributing"
                        value="contributing"
                        @sidenav-select=${this.handleGuideSelect}
                    >
                        <sp-sidenav-item
                            value="adding-component"
                            label="Adding Components"
                        ></sp-sidenav-item>
                        <sp-sidenav-item
                            value="spectrum-config"
                            label="Spectrum Config Reference"
                        ></sp-sidenav-item>
                    </sp-sidenav-item>
                </sp-sidenav>
            </div>
        `;
    }
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

    private handleSearchInput(event: InputEvent) {
        if (event.target) {
            const searchField = event.target as Search;
            this.updateSearchResults(searchField.value);
        }
    }

    private updateSearchResults(value: string): void {
        if (!this.index || value.length < 3) {
            this.open = false;
            return;
        }

        this.open = true;

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
    }

    firstUpdated(): void {
        this.index = lunr.Index.load(searchIndex);
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
                                            @click=${() =>
                                                AppRouter.go(result.url)}
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
                <sp-popover ?open=${this.open}>
                    ${this.renderResults()}
                </sp-popover>
            </div>
        `;
    }
}

customElements.define('docs-side-nav', SideNav);
customElements.define('docs-search', SearchComponent);
