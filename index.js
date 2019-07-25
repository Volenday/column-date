import React, { Component } from 'react';
import moment from 'moment-timezone';
import InputDate from '@volenday/input-date';

// antd
import DatePicker from 'antd/es/date-picker';
import 'antd/es/date-picker/style/css';

import './styles.css';

export default props => {
	const {
		editable = false,
		fieldType,
		filterType = 'dateRange',
		timezone = 'auto',
		headerStyle = {},
		id,
		onChange,
		onChangeText,
		style = {},
		withTime = false,
		...defaultProps
	} = props;
	let { defaultValue } = props;

	if (defaultValue == '') {
		if (filterType == 'date') {
			defaultValue = null;
		}
	}

	let momentFormat = 'MMMM DD, YYYY';
	switch (fieldType) {
		case 'datetime':
			momentFormat = 'MMMM DD, YYYY hh:mm A';
			break;
		case 'time':
			momentFormat = 'hh:mm A';
			break;
	}

	if (typeof defaultValue == 'string') {
		if (filterType == 'date') {
			if (defaultValue) {
				defaultValue = moment(defaultValue);
			}
		}
	}

	return {
		...defaultProps,
		style: { ...style, display: 'flex', alignItems: 'center' },
		headerStyle: { ...headerStyle, display: 'flex', alignItems: 'center' },
		Cell: ({ index, original, value }) => {
			if (editable) {
				return (
					<div class="input-group" style={{ display: 'flex' }}>
						<InputDate
							styles={{ minWidth: 0, flex: 1 }}
							id={id}
							value={
								timezone === 'auto'
									? value
									: moment(value)
											.utc()
											.tz(timezone)
											.format(momentFormat)
							}
							timezone={timezone}
							onChange={(field, value) => onChangeText(index, field, value)}
							withTime={withTime}
						/>
						<div
							class="input-group-append"
							onClick={e => onChange({ Id: original.Id, [id]: value })}
							style={{ cursor: 'pointer' }}>
							<span class="input-group-text" style={{ height: '40px' }}>
								<i class="fas fa-save" />
							</span>
						</div>
					</div>
				);
			}

			return (
				<span>
					{moment(value).isValid()
						? timezone === 'auto'
							? moment(value).format(momentFormat)
							: moment(value)
									.utc()
									.tz(timezone)
									.format(momentFormat)
						: null}
				</span>
			);
		},
		Filter: ({ onChange }) => {
			if (filterType == 'date')
				return <DatePicker onChange={e => onChange(e ? e.toJSON() : '')} value={defaultValue} />;

			if (filterType == 'dateRange') return <CustomDateRange defaultValue={defaultValue} onChange={onChange} />;

			return null;
		}
	};
};

class CustomDateRange extends Component {
	state = { endDate: false, startDate: false };

	render() {
		const { endDate, startDate } = this.state;
		let { defaultValue, onChange } = this.props;

		if (defaultValue == '') {
			defaultValue = {
				startDate: startDate ? moment(startDate) : false,
				endDate: endDate ? moment(endDate) : false
			};
		} else {
			if (startDate || endDate) {
				defaultValue = {
					startDate: startDate ? moment(startDate) : false,
					endDate: endDate ? moment(endDate) : false
				};
			}
		}

		if (typeof defaultValue == 'string') {
			if (defaultValue.includes('*')) {
				const defaultValueSplit = defaultValue.split('*'),
					defaultValueStartDate = defaultValueSplit[0],
					defaultValueEndDate = defaultValueSplit[1];
				defaultValue = {
					startDate: moment(defaultValueStartDate),
					endDate: moment(defaultValueEndDate)
				};
			}
		}

		return (
			<DatePicker.RangePicker
				onChange={async e => {
					if (e.length == 0) return onChange('');

					const [start, end] = e;

					const startDate = start.toJSON(),
						endDate = end.toJSON();

					await this.setState({ endDate, startDate });
					onChange(`${startDate}*${endDate}`);
				}}
				value={[defaultValue.startDate, defaultValue.endDate]}
			/>
		);
	}
}
