import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Directive, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID } from '@angular/core';

@Directive({
    selector: '[pIntersectionObserver]',
    standalone: true
})
export class IntersectionObserverDirective implements OnInit, OnDestroy {
    @Input() ioOptions: any;
    @Output() visible: EventEmitter<void> = new EventEmitter<void>();

    private observer: IntersectionObserver | null = null;

    // tipagem de ElementRef para HTMLElement para maior clareza ao usar IntersectionObserver
    constructor(private el: ElementRef<HTMLElement>, @Inject(PLATFORM_ID) private platformId: any) {}

    ngOnInit() {
        // verifica disponibilidade do IntersectionObserver e garante que o elemento existe antes de observar
        if (isPlatformBrowser(this.platformId) && typeof IntersectionObserver !== 'undefined') {
            const element = this.el.nativeElement as HTMLElement | null;
            if (!element) {
                return;
            }

            // remove/desobserva e desconecta o observador antes de emitir para evitar retenção de referências
            this.observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    this.observer?.unobserve(element);
                    this.observer?.disconnect();
                    this.observer = null;
                    this.visible.emit();
                }
            }, this.ioOptions);

            try {
                this.observer.observe(element);
            } catch {
                // ignora falhas no observe em ambientes incompatíveis
            }
        }
    }

    ngOnDestroy() {
        // desconecta e limpa a referência do observador para evitar retenção de memória
        this.observer?.disconnect();
        this.observer = null;
    }
}

@Component({
    selector: 'p-deferred-demo',
    standalone: true,
    imports: [CommonModule, IntersectionObserverDirective],
    template: `
        @if (!visible) {
            <div class="card" pIntersectionObserver [ioOptions]="options" (visible)="onVisible()">
                <div class="deferred-demo-loading"></div>
            </div>
        } @else {
            <ng-content></ng-content>
        }
    `,
    styleUrl: './deferreddemo.scss'
})

export class DeferredDemo {
    visible: boolean = false;

    timeout: any = null;

    @Input() options: any;

    @Output() load: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(@Inject(PLATFORM_ID) private platformId: any) {}

    onVisible() {
        clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            this.visible = true;
            this.load.emit();
        }, 350);
    }

    ngOnDestroy() {
        clearTimeout(this.timeout);
    }
}