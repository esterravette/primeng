import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    InjectionToken,
    input,
    NgModule,
    ViewEncapsulation,
    AfterViewChecked
} from '@angular/core';
import { Bind } from 'primeng/bind';
import { FluidPassThrough } from 'primeng/types/fluid';
import { FluidStyle } from './style/fluidstyle';
import { cn, getKeyValue, mergeProps, resolve, toFlatCase } from '@primeuix/utils';

const FLUID_INSTANCE = new InjectionToken<Fluid>('FLUID_INSTANCE');

/**
 * Fluid is a layout component to make descendant components span full width of their container.
 * @group Components
 */
@Component({
    selector: 'p-fluid',
    template: ` <ng-content></ng-content> `,
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [FluidStyle, { provide: FLUID_INSTANCE, useExisting: Fluid }],
    host: {
        '[class]': "hostClasses"
    },
    hostDirectives: [Bind]
})

export class Fluid implements AfterViewChecked {

    // composição
    private readonly componentStyle = inject(FluidStyle);

    $pcFluid: Fluid | undefined = inject(FLUID_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    // inputs que antes eram herdados de BaseComponent
    pt = input<FluidPassThrough>();
    unstyled = input<boolean>(false);

    ngAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    _componentStyle = inject(FluidStyle);

    cx(key: string, params: Record<string, unknown> = {}) {
        if (this.unstyled()) return undefined;
        const classes = getKeyValue(this.componentStyle.classes, key, params);
        return cn(classes);
    }

    get hostClasses(): string {
        return this.cx('root') ?? '';
    }

    ptm(key: string, params: Record<string, unknown> = {}) {
        const ptConfig = (this.pt() || {}) as Record<string, unknown>;
        return this.getPTValue(ptConfig, key, params);
    }

    ptms(keys: string[], params: Record<string, unknown> = {}) {
        return keys.reduce((acc, arg) => {
            const merged = mergeProps(acc, this.ptm(arg, params));
            return (merged || {}) as Record<string, unknown>;
        }, {} as Record<string, unknown>);
    }

    private getPTValue(obj: Record<string, unknown>, key: string, params: Record<string, unknown>) {
        const datasetPrefix = 'data-pc-';
        const self = resolve(getKeyValue(obj, key), params);
        const datasets = key !== 'transition' && {
            [`${datasetPrefix}section`]: toFlatCase(key)
        };
        return mergeProps(self, datasets);
    }
}

@NgModule({
    imports: [Fluid],
    exports: [Fluid]
})
export class FluidModule {}