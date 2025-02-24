import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';

import { SelOptionsComponent } from '../../gui-helpers/sel-options/sel-options.component';

import { FlexHeadComponent } from './flex-head/flex-head.component';
import { FlexEventComponent } from './flex-event/flex-event.component';
import { FlexActionComponent } from './flex-action/flex-action.component';
import { GaugeProperty, GaugeSettings, View } from '../../_models/hmi';
import { Script } from '../../_models/script';
import { UserGroups } from '../../_models/user';
import { InputType } from './flex-input/flex-input.component';

@Component({
    selector: 'gauge-property',
    templateUrl: './gauge-property.component.html',
    styleUrls: ['./gauge-property.component.css']
})
export class GaugePropertyComponent implements OnInit {

    @Input() name: any;
    @ViewChild('flexhead') flexHead: FlexHeadComponent;
    @ViewChild('flexevent') flexEvent: FlexEventComponent;
    @ViewChild('flexaction') flexAction: FlexActionComponent;

    slideView = true;
    slideActionView = true;
    withBitmask = false;
    property: GaugeProperty;
    dialogType: GaugeDialogType = GaugeDialogType.RangeWithAlarm;
    eventsSupported: boolean;
    actionsSupported: any;
    views: View[];
    defaultValue: any;
    inputs: GaugeSettings[];
    scripts: Script[];

    constructor(public dialog: MatDialog,
        public dialogRef: MatDialogRef<GaugePropertyComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
        this.dialogType = this.data.dlgType;
        this.eventsSupported = this.data.withEvents;
        this.actionsSupported = this.data.withActions;
        this.views = this.data.views;
        this.inputs = this.data.inputs;
        this.scripts = this.data.scripts;
        this.property = JSON.parse(JSON.stringify(this.data.settings.property));
        if (!this.property) {
            this.property = new GaugeProperty();
        }

        this.defaultValue = this.data.default;

        if (this.dialogType === GaugeDialogType.OnlyValue) {
            this.flexHead.withInput = InputType.update;
        } else if (this.dialogType === GaugeDialogType.ValueAndUnit) {
            this.flexHead.withInput = InputType.unit;
        } else {
            this.flexHead.defaultValue = this.defaultValue;
            this.flexHead.withInput = InputType.range;
            if (this.dialogType === GaugeDialogType.ValueWithRef) {
                this.flexHead.withInput = InputType.text;
            } else if (this.dialogType === GaugeDialogType.Step) {
                this.flexHead.withInput = InputType.step;
            } else if (this.dialogType === GaugeDialogType.MinMax) {
                this.flexHead.withInput = InputType.minmax;
            }
        }

        if (this.data.withBitmask) {
            this.withBitmask = this.data.withBitmask;
            this.withBitmask = this.data.withBitmask;
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        // this.data.settings.property = this.flexHead.property;
        this.data.settings.property = this.flexHead.getProperty();
        if (this.flexEvent) {
            this.data.settings.property.events = this.flexEvent.getEvents();
        }
        if (this.flexAction) {
            this.data.settings.property.actions = this.flexAction.getActions();
        }
        if (this.property.readonly) {
            this.property.readonly = true;
        } else {
            delete this.property.readonly;
        }
    }

    onAddInput() {
        this.flexHead.onAddInput();
    }

    onAddEvent() {
        this.flexEvent.onAddEvent();
    }

    onAddAction() {
        this.flexAction.onAddAction();
    }

    onRangeViewToggle() {
        this.flexHead.onRangeViewToggle(this.slideView);
    }

    onActionRangeViewToggle() {
        this.flexAction.onRangeViewToggle(this.slideActionView);
    }

    isToolboxToShow() {
        if (this.dialogType === GaugeDialogType.RangeWithAlarm || this.dialogType === GaugeDialogType.Range || this.dialogType === GaugeDialogType.Step || 
            this.dialogType === GaugeDialogType.RangeAndText) {
            return true;
        }
        return false;
    }

    isRangeToShow() {
        if (this.dialogType === GaugeDialogType.RangeWithAlarm || this.dialogType === GaugeDialogType.Range || this.dialogType === GaugeDialogType.RangeAndText) {
            return true;
        }
        return false;
    }

    isTextToShow() {
        if (this.dialogType === GaugeDialogType.RangeAndText) {
            return true;
        }
        return false;
    }

    isAlarmToShow() {
        if (this.dialogType === GaugeDialogType.RangeWithAlarm) {
            return true;
        }
        return false;
    }

    isReadonlyToShow() {
        if (this.dialogType === GaugeDialogType.Step) {
            return true;
        }
        return false;
    }

    onEditPermission() {
        let permission = this.property.permission;
        let dialogRef = this.dialog.open(DialogGaugePermission, {
            position: { top: '60px' },
            data: { permission: permission }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.property.permission = result.permission;
            }
        });
    }
}

export enum GaugeDialogType {
    Range,
    RangeAndText,
    RangeWithAlarm,
    OnlyValue,
    ValueAndUnit,
    ValueWithRef,
    Step,
    MinMax,
    Chart,
    Gauge,
    Pipe,
    Slider,
    Switch,
    Graph,
    Iframe,
    Table
}

@Component({
    selector: 'dialog-gaugepermission',
    templateUrl: './gauge-permission.dialog.html',
})
export class DialogGaugePermission {
    // defaultColor = Utils.defaultColor;
    selectedGroups = [];
    extensionGroups = [];
    groups = UserGroups.Groups;

    @ViewChild(SelOptionsComponent) seloptions: SelOptionsComponent;

    constructor(
        public dialogRef: MatDialogRef<DialogGaugePermission>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.selectedGroups = UserGroups.ValueToGroups(this.data.permission);
        this.extensionGroups = UserGroups.ValueToGroups(this.data.permission, true);

    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.data.permission = UserGroups.GroupsToValue(this.seloptions.selected);
        this.data.permission += UserGroups.GroupsToValue(this.seloptions.extSelected, true);
        this.dialogRef.close(this.data);
    }
}
