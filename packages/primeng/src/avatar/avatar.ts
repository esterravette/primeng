import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectionStrategy, Component, EventEmitter, inject, InjectionToken, Input, input, NgModule, Output, ViewEncapsulation } from '@angular/core';
import { cn, getKeyValue, mergeProps, resolve, toFlatCase } from '@primeuix/utils';
import { SharedModule } from 'primeng/api';
import { Bind } from 'primeng/bind';
import { PrimeNG } from 'primeng/config';
import { AvatarPassThrough } from 'primeng/types/avatar';
import { AvatarStyle } from './style/avatarstyle';

const AVATAR_INSTANCE = new InjectionToken<Avatar>('AVATAR_INSTANCE');

/**
 * Avatar represents people using icons, labels and images.
 * @group Components
 */
@Component({
    selector: 'p-avatar',
    standalone: true,
    imports: [CommonModule, SharedModule, Bind],
    template: `
        <ng-content></ng-content>
        <span [pBind]="ptm('label')" [class]="cx('label')" *ngIf="label; else iconTemplate" [attr.data-p]="dataP">{{ label }}</span>
        <ng-template #iconTemplate><span [pBind]="ptm('icon')" [class]="icon" [ngClass]="cx('icon')" *ngIf="icon; else imageTemplate" [attr.data-p]="dataP"></span></ng-template>
        <ng-template #imageTemplate><img [pBind]="ptm('image')" [src]="image" *ngIf="image" (error)="imageError($event)" [attr.aria-label]="ariaLabel" [attr.data-p]="dataP" /></ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        // lógica movida para getter local 'hostClasses'
        '[class]': 'hostClasses',
        '[attr.aria-label]': 'ariaLabel',
        '[attr.aria-labelledby]': 'ariaLabelledBy',
        '[attr.data-p]': 'dataP'
    },

    providers: [AvatarStyle, { provide: AVATAR_INSTANCE, useExisting: Avatar }],
    hostDirectives: [Bind]
})
export class Avatar implements AfterViewChecked {
    // injeção de dependência direta
    // o componente pede os dados que precisa, não uma classe base que faz tudo
    config = inject(PrimeNG);
    private style = inject(AvatarStyle);

    bindDirectiveInstance = inject(Bind, { self: true });
    $pcAvatar: Avatar | undefined = inject(AVATAR_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    unstyled = input<boolean>(false);
    pt = input<AvatarPassThrough | undefined>();

    /**
     * Defines the text to display.
     * @group Props
     */
    @Input() label: string | undefined;
    /**
     * Defines the icon to display.
     * @group Props
     */
    @Input() icon: string | undefined;
    /**
     * Defines the image to display.
     * @group Props
     */
    @Input() image: string | undefined;
    /**
     * Size of the element.
     * @group Props
     */
    @Input() size: 'normal' | 'large' | 'xlarge' | undefined = 'normal';
    /**
     * Shape of the element.
     * @group Props
     */
    @Input() shape: 'square' | 'circle' | undefined = 'square';
    /**
     * Class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    @Input() styleClass: string | undefined;
    /**
     * Establishes a string value that labels the component.
     * @group Props
     */
    @Input() ariaLabel: string | undefined;
    /**
     * Establishes relationships between the component and label(s) where its value should be one or more element IDs.
     * @group Props
     */
    @Input() ariaLabelledBy: string | undefined;
    /**
     * This event is triggered if an error occurs while loading an image file.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    @Output() onImageError: EventEmitter<Event> = new EventEmitter<Event>();

    _componentStyle = inject(AvatarStyle);

    constructor() {}

    ngAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    imageError(event: Event) {
        this.onImageError.emit(event);
    }

    // lógica local de classes
    cx(key: string, params = {}) {
        // verifica o estado local (signal unstyled)
        if (this.unstyled()) return undefined;

        // busca as classes diretamente no estilo injetado (AvatarStyle)
        const classes = getKeyValue(this.style.classes, key, params);
        return cn(classes);
    }

    // getter para classes do host
    get hostClasses(): string {
        const rootClasses = this.cx('root');
        return cn(rootClasses, this.styleClass) ?? '';
    }

    // lógica local de PassThrough (ptm)
    ptm(key: string, params = {}) {
        const ptConfig = this.pt() || {};
        return this.getPTValue(ptConfig, key, params);
    }

    ptms(keys: string[], params = {}) {
        return keys.reduce((acc, arg) => {
            // mergeProps importado de utils, sem "this.baseService"
            acc = mergeProps(acc, this.ptm(arg, params)) || {};
            return acc;
        }, {});
    }

    private getPTValue(obj: any, key: string, params: any) {
        const datasetPrefix = 'data-pc-';
        const self = resolve(getKeyValue(obj, key), params);
        const datasets = key !== 'transition' && {
            [`${datasetPrefix}section`]: toFlatCase(key)
        };
        return mergeProps(self, datasets);
    }

    get dataP() {
        return cn({
            [this.shape as string]: this.shape,
            [this.size as string]: this.size
        });
    }
}

@NgModule({
    imports: [Avatar, SharedModule],
    exports: [Avatar, SharedModule]
})
export class AvatarModule {}
