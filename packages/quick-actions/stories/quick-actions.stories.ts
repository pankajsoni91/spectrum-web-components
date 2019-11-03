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
import { storiesOf } from '@storybook/polymer';
import { boolean, select } from '@storybook/addon-knobs';
import { html } from 'lit-html';

import '../';
import { entrances } from '../';

storiesOf('Quick Actions', module)
    .add('Text Only', () => {
        const possibleEnteraces = ['', ...entrances];
        return html`
            <sp-quick-actions
                text-only
                ?open=${boolean('Is Open', false, 'Element')}
                ?overlay=${boolean('Has Overlay', false, 'Element')}
                enter-from=${select(
                    'Enter From',
                    possibleEnteraces,
                    possibleEnteraces[0],
                    'Element'
                )}
            >
                <sp-action-button quiet slot="action">
                    Action 1
                </sp-action-button>
                <sp-action-button quiet slot="action">
                    Action 2
                </sp-action-button>
                <img
                    tabindex="0"
                    src="https://placedog.net/300/400?id=15"
                    alt="Place Dog"
                />
            </sp-quick-actions>
        `;
    })
    .add('Icon Buttons', () => {
        const possibleEnteraces = ['', ...entrances];
        return html`
            <sp-icons-medium></sp-icons-medium>
            <sp-quick-actions
                ?open=${boolean('Is Open', false, 'Element')}
                ?overlay=${boolean('Has Overlay', false, 'Element')}
                enter-from=${select(
                    'Enter From',
                    possibleEnteraces,
                    possibleEnteraces[0],
                    'Element'
                )}
            >
                <sp-action-button quiet slot="action">
                    <sp-icon name="ui:HelpMedium" slot="icon"></sp-icon>
                </sp-action-button>
                <sp-action-button quiet slot="action">
                    <sp-icon name="ui:InfoMedium" slot="icon"></sp-icon>
                </sp-action-button>
                <img src="https://placedog.net/400/300?id=10" alt="Place Dog" />
            </sp-quick-actions>
        `;
    });
