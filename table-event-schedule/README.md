# Table - Event Schedule
This component can be used to display table data in a responsive format.

## Fields
These are the fields you will need to set up in order to make it work

#### Custom Title

This is the title that will be displayed above the table.

| Field         | Value                             |
| ------------- | --------------------------------- |
| Label         | `Custom Title`                    |
| Field Id      | `customTitle`                     |
| Field Type    | `Text`                            |
| Default Value | `My custom table data - Schedule` |

#### Events

This is the table data that will be displayed in the table. It is a repeater field, so you can add as many rows as you need.

| Field         | Value        |
| ------------- | ------------ |
| Label         | `Events`     |
| Field Id      | `events`     |
| Field Type    | `Repeater` * |
| Singular Name | `event`      |

* The `Repeater` field type allows you to configure sub fields. These are the sub field settings.

| Input Field (Label) | Field ID      | Default Value | Field Type | Options              |
| ------------------- | ------------- | ------------- | ---------- | -------------------- |
| Title               | `title`       |               | `Text`     |  N/A                 |
| Description         | `description` |               | `Text`     |  N/A                 |
| Start               | `start`       |               | `Text`     |  N/A                 |
| Finish              | `finish`      |               | `Text`     |  N/A                 |
| Type                | `type`        | `generic`     | `Select`   | `generic`, `special` |
