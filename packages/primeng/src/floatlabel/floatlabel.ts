import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectionStrategy, Component, inject, InjectionToken, Input, input, NgModule, ViewEncapsulation } from '@angular/core';
import { cn, getKeyValue, mergeProps, resolve, toFlatCase } from '@primeuix/utils';
import { SharedModule } from 'primeng/api';
import { Bind, BindModule } from 'primeng/bind';
import { FloatLabelPassThrough } from 'primeng/types/floatlabel';
import { FloatLabelStyle } from './style/floatlabelstyle';

const FLOATLABEL_INSTANCE = new InjectionToken<FloatLabel>('FLOATLABEL_INSTANCE');

/**
 * FloatLabel appears on top of the input field when focused.
 * @group Components
 */
@Component({
    selector: 'p-floatlabel, p-floatLabel, p-float-label',
    standalone: true,
    imports: [CommonModule, SharedModule, BindModule],
    template: ` <ng-content></ng-content> `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [FloatLabelStyle, { provide: FLOATLABEL_INSTANCE, useExisting: FloatLabel }],
    host: {
        // cx('root') substituído por getter local hostClasses
        '[class]': 'hostClasses'
    },
    hostDirectives: [Bind]
})
export class FloatLabel implements AfterViewChecked {
    // composição
    private readonly componentStyle = inject(FloatLabelStyle);

    $pcFloatLabel: FloatLabel | undefined = inject(FLOATLABEL_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    // inputs que antes eram herdados de BaseComponent
    pt = input<FloatLabelPassThrough>();
    unstyled = input<boolean>(false);

    ngAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * Defines the positioning of the label relative to the input.
     * @group Props
     */
    @Input() variant: 'in' | 'over' | 'on' = 'over';

    _componentStyle = inject(FloatLabelStyle);

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
        return keys.reduce(
            (acc, arg) => {
                const merged = mergeProps(acc, this.ptm(arg, params));
                return (merged || {}) as Record<string, unknown>;
            },
            {} as Record<string, unknown>
        );
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
    imports: [FloatLabel, SharedModule],
    exports: [FloatLabel, SharedModule]
})

export class FloatLabelModule {}