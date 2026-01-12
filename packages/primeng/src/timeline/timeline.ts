import { CommonModule } from '@angular/common';
import { AfterContentInit, AfterViewChecked, ChangeDetectionStrategy, Component, ContentChild, ContentChildren, ElementRef, inject, InjectionToken, Input, NgModule, QueryList, TemplateRef, ViewEncapsulation } from '@angular/core';
import { BlockableUI, PrimeTemplate, SharedModule } from 'primeng/api';
import { Bind } from 'primeng/bind';
import { Nullable } from 'primeng/ts-helpers';
import { TimelineItemTemplateContext } from 'primeng/types/timeline';
import { TimelineStyle } from './style/timelinestyle';

const TIMELINE_INSTANCE = new InjectionToken<Timeline>('TIMELINE_INSTANCE');

/**
 * Timeline visualizes a series of chained events.
 * @group Components
 */
@Component({
    selector: 'p-timeline',
    standalone: true,
    imports: [CommonModule, SharedModule, Bind],
    template: `
        <div [pBind]="ptm('event')" *ngFor="let event of value; let last = last" [class]="cx('event')" [attr.data-p]="dataP">
            <div [pBind]="ptm('eventOpposite')" [class]="cx('eventOpposite')" [attr.data-p]="dataP">
                <ng-container *ngTemplateOutlet="oppositeTemplate || _oppositeTemplate; context: { $implicit: event }"></ng-container>
            </div>
            <div [pBind]="ptm('eventSeparator')" [class]="cx('eventSeparator')" [attr.data-p]="dataP">
                <ng-container *ngIf="markerTemplate || _markerTemplate; else marker">
                    <ng-container *ngTemplateOutlet="markerTemplate || _markerTemplate; context: { $implicit: event }"></ng-container>
                </ng-container>
                <ng-template #marker>
                    <div [pBind]="ptm('eventMarker')" [class]="cx('eventMarker')" [attr.data-p]="dataP"></div>
                </ng-template>
                <div [pBind]="ptm('eventConnector')" *ngIf="!last" [class]="cx('eventConnector')" [attr.data-p]="dataP"></div>
            </div>
            <div [pBind]="ptm('eventContent')" [class]="cx('eventContent')" [attr.data-p]="dataP">
                <ng-container *ngTemplateOutlet="contentTemplate || _contentTemplate; context: { $implicit: event }"></ng-container>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [TimelineStyle, { provide: TIMELINE_INSTANCE, useExisting: Timeline }],
    host: {
        // cn(cx('root')...) substituído por getter local hostClasses
        '[class]': 'hostClasses',
        '[attr.data-p]': 'dataP'
    },
    hostDirectives: [Bind]
})

// extends BaseComponent removido, BlockableUI e interfaces de lifecycle implementados
export class Timeline implements BlockableUI, AfterContentInit, AfterViewChecked {
    // injeção explícita de ElementRef
    el = inject(ElementRef);

    bindDirectiveInstance = inject(Bind, { self: true });

    $pcTimeline: Timeline | undefined = inject(TIMELINE_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    /**
     * An array of events to display.
     * @group Props
     */
    @Input() value: any[] | undefined;
    /**
     * Style class of the component.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    @Input() styleClass: string | undefined;
    /**
     * Position of the timeline bar relative to the content. Valid values are "left", "right" for vertical layout and "top", "bottom" for horizontal layout.
     * @group Props
     */
    @Input() align: string = 'left';
    /**
     * Orientation of the timeline.
     * @group Props
     */
    @Input() layout: 'vertical' | 'horizontal' = 'vertical';
    /**
     * Custom content template.
     * @param {TimelineItemTemplateContext} context - item context.
     * @see {@link TimelineItemTemplateContext}
     * @group Templates
     */
    @ContentChild('content', { descendants: false }) contentTemplate: Nullable<TemplateRef<TimelineItemTemplateContext>>;

    /**
     * Custom opposite item template.
     * @param {TimelineItemTemplateContext} context - item context.
     * @see {@link TimelineItemTemplateContext}
     * @group Templates
     */
    @ContentChild('opposite', { descendants: false }) oppositeTemplate: Nullable<TemplateRef<TimelineItemTemplateContext>>;

    /**
     * Custom marker template.
     * @param {TimelineItemTemplateContext} context - item context.
     * @see {@link TimelineItemTemplateContext}
     * @group Templates
     */
    @ContentChild('marker', { descendants: false }) markerTemplate: Nullable<TemplateRef<TimelineItemTemplateContext>>;

    @ContentChildren(PrimeTemplate) templates: Nullable<QueryList<any>>;

    _contentTemplate: TemplateRef<TimelineItemTemplateContext> | undefined;

    _oppositeTemplate: TemplateRef<TimelineItemTemplateContext> | undefined;

    _markerTemplate: TemplateRef<TimelineItemTemplateContext> | undefined;

    _componentStyle = inject(TimelineStyle);

    getBlockableElement(): HTMLElement {
        return this.el.nativeElement.children[0];
    }

    ngAfterContentInit() {
        (this.templates as QueryList<PrimeTemplate>).forEach((item) => {
            switch (item.getType()) {
                case 'content':
                    this._contentTemplate = item.template;
                    break;

                case 'opposite':
                    this._oppositeTemplate = item.template;
                    break;

                case 'marker':
                    this._markerTemplate = item.template;
                    break;
            }
        });
    }

    // implementação local de cx para substituir a lógica herdada
    cx(key: string): string {
        // mapeamento simples das classes padrão do Timeline
        const classes: { [key: string]: string } = {
            event: 'p-timeline-event',
            eventOpposite: 'p-timeline-event-opposite',
            eventSeparator: 'p-timeline-event-separator',
            eventMarker: 'p-timeline-event-marker',
            eventConnector: 'p-timeline-event-connector',
            eventContent: 'p-timeline-event-content'
        };
        return classes[key] || '';
    }

    // lógica de classes do host trazida para getter local
    get hostClasses(): string {
        const classes = ['p-timeline p-component'];

        if (this.layout) classes.push(`p-timeline-${this.layout}`);
        if (this.align) classes.push(`p-timeline-${this.align}`);
        if (this.styleClass) classes.push(this.styleClass);

        return classes.join(' ');
    }

    // lógica de data attribute local
    get dataP() {
        return [this.layout, this.align].filter(Boolean).join(' ');
    }
}

@NgModule({
    imports: [Timeline, SharedModule],
    exports: [Timeline, SharedModule]
})
export class TimelineModule {}
