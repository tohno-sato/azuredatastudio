/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from 'vs/base/common/uri';
import { IEmptyWindowBackupInfo } from 'vs/platform/backup/node/backup';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IFolderBackupInfo, IWorkspaceBackupInfo } from 'vs/platform/backup/common/backup';
import { IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';

export const IBackupMainService = createDecorator<IBackupMainService>('backupMainService');

export interface IBackupMainService {
	readonly _serviceBrand: undefined;

	isHotExitEnabled(): boolean;

	getWorkspaceBackups(): IWorkspaceBackupInfo[];
	getFolderBackupPaths(): IFolderBackupInfo[];
	getEmptyWindowBackupPaths(): IEmptyWindowBackupInfo[];

	registerWorkspaceBackupSync(workspace: IWorkspaceBackupInfo, migrateFrom?: string): string;
	registerFolderBackupSync(folderUri: IFolderBackupInfo): string;
	registerEmptyWindowBackupSync(backupFolder?: string, remoteAuthority?: string): string;

	unregisterWorkspaceBackupSync(workspace: IWorkspaceIdentifier): void;
	unregisterFolderBackupSync(folderUri: URI): void;
	unregisterEmptyWindowBackupSync(backupFolder: string): void;

	/**
	 * All folders or workspaces that are known to have
	 * backups stored. This call is long running because
	 * it checks for each backup location if any backups
	 * are stored.
	 */
	getDirtyWorkspaces(): Promise<Array<IWorkspaceBackupInfo | IFolderBackupInfo>>;
}
