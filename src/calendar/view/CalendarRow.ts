import type { CalendarEvent } from "../../api/entities/tutanota/TypeRefs.js"
import { locator } from "../../api/main/MainLocator.js"
import m, { Children, VnodeDOM } from "mithril"

import { SelectableRowContainer, SelectableRowContainerAttrs, SelectableRowSelectedSetter } from "../../gui/SelectableRowContainer.js"
import { VirtualRow } from "../../gui/base/ListUtils.js"
import { formatEventDuration, getEventColor, getGroupColors, getTimeZone } from "../date/CalendarUtils.js"
import { ViewHolder } from "../../gui/base/List.js"
import { styles } from "../../gui/styles.js"
import { DefaultAnimationTime } from "../../gui/animation/Animations.js"

export class CalendarRow implements VirtualRow<CalendarEvent> {
	top: number

	entity: CalendarEvent | null
	colors: Map<any, any>

	private selectionSetter!: SelectableRowSelectedSetter
	private calendarIndicatorDom!: HTMLElement
	private summaryDom!: HTMLElement
	private durationDom!: HTMLElement

	constructor(readonly domElement: HTMLElement) {
		this.top = 0
		this.entity = null
		this.colors = getGroupColors(locator.logins.getUserController().userSettingsGroupRoot)
	}

	update(event: CalendarEvent, selected: boolean, isInMultiSelect: boolean): void {
		this.entity = event
		this.summaryDom.innerText = event.summary
		this.calendarIndicatorDom.style.backgroundColor = `#${getEventColor(event, this.colors)}`
		this.durationDom.innerText = formatEventDuration(this.entity, getTimeZone(), false)

		this.selectionSetter(selected, isInMultiSelect)
	}

	/**
	 * Only the structure is managed by mithril. We set all contents on our own (see update) in order to avoid the vdom overhead (not negligible on mobiles)
	 */
	render(): Children {
		return m(
			SelectableRowContainer,
			{
				onSelectedChangeRef: (changer) => {
					this.selectionSetter = changer
				},
			} satisfies SelectableRowContainerAttrs,
			m(
				".flex.items-center.gap-vpad.click.plr.border-radius.pt-s.pb-s",
				{
					class: (styles.isDesktopLayout() ? "" : "state-bg") + "limit-width full-width",
					style: {
						transition: `background ${DefaultAnimationTime}ms`,
					},
				},
				[
					m("", {
						style: {
							minWidth: "16px",
							minHeight: "16px",
							borderRadius: "50%",
						},
						oncreate: (vnode: VnodeDOM) => {
							this.calendarIndicatorDom = vnode.dom as HTMLElement
						},
					}),
					m(".flex.col", { class: "min-width-0" }, [
						m("p.b.m-0", {
							class: "text-ellipsis",
							oncreate: (vnode: VnodeDOM) => {
								this.summaryDom = vnode.dom as HTMLElement
							},
						}),
						m("", {
							oncreate: (vnode: VnodeDOM) => {
								this.durationDom = vnode.dom as HTMLElement
							},
						}),
					]),
				],
			),
		)
	}
}

export class KindaCalendarRow implements ViewHolder<CalendarEvent> {
	readonly cr: CalendarRow
	domElement: HTMLElement
	entity: CalendarEvent | null = null

	constructor(dom: HTMLElement) {
		this.cr = new CalendarRow(dom)
		this.domElement = dom
		m.render(dom, this.cr.render())
	}

	update(item: CalendarEvent, selected: boolean, isInMultiSelect: boolean) {
		this.entity = item
		this.cr.update(item, selected, isInMultiSelect)
	}

	render(): Children {
		return this.cr.render()
	}
}