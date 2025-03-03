/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Application, Terminal, TerminalCommandId, TerminalCommandIdWithValue } from '../../../../automation';

const CONTRIBUTED_PROFILE_NAME = `JavaScript Debug Terminal`;
const ANY_PROFILE_NAME = '^((?!JavaScript Debug Terminal).)*$';

export function setup() {
	describe('Terminal Profiles', () => {
		// Acquire automation API
		let terminal: Terminal;
		before(function () {
			const app = this.app as Application;
			terminal = app.workbench.terminal;
		});

		it('should launch the default profile', async () => {
			await terminal.runCommand(TerminalCommandId.Show);
			await terminal.assertSingleTab({ name: ANY_PROFILE_NAME });
		});

		it.skip('should set the default profile to a contributed one', async () => {
			await terminal.runCommandWithValue(TerminalCommandIdWithValue.SelectDefaultProfile, CONTRIBUTED_PROFILE_NAME);
			await terminal.createTerminal();
			await terminal.assertSingleTab({ name: CONTRIBUTED_PROFILE_NAME });
		});

		it.skip('should use the default contributed profile on panel open and for splitting', async () => {
			await terminal.runCommandWithValue(TerminalCommandIdWithValue.SelectDefaultProfile, CONTRIBUTED_PROFILE_NAME);
			await terminal.runCommand(TerminalCommandId.Show);
			await terminal.runCommand(TerminalCommandId.Split);
			await terminal.assertTerminalGroups([[{ name: CONTRIBUTED_PROFILE_NAME }, { name: CONTRIBUTED_PROFILE_NAME }]]);
		});

		it('should set the default profile', async () => {
			await terminal.runCommandWithValue(TerminalCommandIdWithValue.SelectDefaultProfile, process.platform === 'win32' ? 'PowerShell' : undefined);
			await terminal.createTerminal();
			await terminal.assertSingleTab({ name: ANY_PROFILE_NAME });
		});

		it('should use the default profile on panel open and for splitting', async () => {
			await terminal.runCommand(TerminalCommandId.Show);
			await terminal.assertSingleTab({ name: ANY_PROFILE_NAME });
			await terminal.runCommand(TerminalCommandId.Split);
			await terminal.assertTerminalGroups([[{}, {}]]);
		});

		it('createWithProfile command should create a terminal with a profile', async () => {
			await terminal.runCommandWithValue(TerminalCommandIdWithValue.NewWithProfile);
			await terminal.assertSingleTab({ name: ANY_PROFILE_NAME });
		});

		it.skip('createWithProfile command should create a terminal with a contributed profile', async () => {
			await terminal.runCommandWithValue(TerminalCommandIdWithValue.NewWithProfile, CONTRIBUTED_PROFILE_NAME);
			await terminal.assertSingleTab({ name: CONTRIBUTED_PROFILE_NAME });
		});

		it('createWithProfile command should create a split terminal with a profile', async () => {
			await terminal.runCommand(TerminalCommandId.Show);
			await terminal.runCommandWithValue(TerminalCommandIdWithValue.NewWithProfile, undefined, true);
			await terminal.assertTerminalGroups([[{}, {}]]);
		});

		it.skip('createWithProfile command should create a split terminal with a contributed profile', async () => {
			await terminal.runCommand(TerminalCommandId.Show);
			await terminal.assertSingleTab({});
			await terminal.runCommandWithValue(TerminalCommandIdWithValue.NewWithProfile, CONTRIBUTED_PROFILE_NAME, true);
			await terminal.assertTerminalGroups([[{ name: ANY_PROFILE_NAME }, { name: CONTRIBUTED_PROFILE_NAME }]]);
		});
	});
}
