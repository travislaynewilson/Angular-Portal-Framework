import { EmbeddedViewRef } from '@angular/core';
import { CellOutletRowContext } from './row';



/** Class used to conveniently type the embedded view ref for rows with a context. */
export abstract class RowViewContext<T> extends EmbeddedViewRef<CellOutletRowContext<T>> { }