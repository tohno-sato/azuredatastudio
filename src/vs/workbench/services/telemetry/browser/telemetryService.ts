/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ITelemetryService, ITelemetryInfo, ITelemetryData } from 'vs/platform/telemetry/common/telemetry';
import { NullTelemetryService, combinedAppender, LogAppender, ITelemetryAppender, validateTelemetryData } from 'vs/platform/telemetry/common/telemetryUtils';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { ILogService } from 'vs/platform/log/common/log';
import { TelemetryService as BaseTelemetryService, ITelemetryServiceConfig } from 'vs/platform/telemetry/common/telemetryService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ClassifiedEvent, StrictPropertyCheck, GDPRClassification } from 'vs/platform/telemetry/common/gdprTypings';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { resolveWorkbenchCommonProperties } from 'vs/platform/telemetry/browser/workbenchCommonProperties';
import { IProductService } from 'vs/platform/product/common/productService';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';

export class WebTelemetryAppender implements ITelemetryAppender {

	constructor(private _logService: ILogService, private _appender: IRemoteAgentService,
		@IProductService private _productService: IProductService) { } // {{ SQL CARBON EDIT }}

	log(eventName: string, data: any): void {
		data = validateTelemetryData(data);
		this._logService.trace(`telemetry/${eventName}`, data);

		const eventPrefix = this._productService.quality !== 'stable' ? '/adsworkbench/' : '/monacoworkbench/'; // {{SQL CARBON EDIT}}
		this._appender.logTelemetry(eventPrefix + eventName, {
			properties: data.properties,
			measurements: data.measurements
		});
	}

	flush(): Promise<void> {
		return this._appender.flushTelemetry();
	}
}

export class TelemetryService extends Disposable implements ITelemetryService {

	_serviceBrand: undefined;

	private impl: ITelemetryService;

	constructor(
		@IWorkbenchEnvironmentService environmentService: IWorkbenchEnvironmentService,
		@ILogService logService: ILogService,
		@IConfigurationService configurationService: IConfigurationService,
		@IStorageService storageService: IStorageService,
		@IProductService productService: IProductService,
		@IRemoteAgentService remoteAgentService: IRemoteAgentService
	) {
		super();

		if (!!productService.enableTelemetry) {
			const config: ITelemetryServiceConfig = {
				appender: combinedAppender(new WebTelemetryAppender(logService, remoteAgentService, productService), new LogAppender(logService)), // {{SQL CARBON EDIT}}
				commonProperties: resolveWorkbenchCommonProperties(storageService, productService.commit, productService.version, environmentService.configuration.remoteAuthority, environmentService.options && environmentService.options.resolveCommonTelemetryProperties)
			};

			this.impl = this._register(new BaseTelemetryService(config, configurationService));
		} else {
			this.impl = NullTelemetryService;
		}
	}

	setEnabled(value: boolean): void {
		return this.impl.setEnabled(value);
	}

	get isOptedIn(): boolean {
		return this.impl.isOptedIn;
	}

	publicLog(eventName: string, data?: ITelemetryData, anonymizeFilePaths?: boolean): Promise<void> {
		return this.impl.publicLog(eventName, data, anonymizeFilePaths);
	}

	publicLog2<E extends ClassifiedEvent<T> = never, T extends GDPRClassification<T> = never>(eventName: string, data?: StrictPropertyCheck<T, E>, anonymizeFilePaths?: boolean) {
		return this.publicLog(eventName, data as ITelemetryData, anonymizeFilePaths);
	}

	getTelemetryInfo(): Promise<ITelemetryInfo> {
		return this.impl.getTelemetryInfo();
	}
}

registerSingleton(ITelemetryService, TelemetryService);
