import React, { Component } from 'react';
import moment from 'moment';
import InputDate from '@volenday/input-date';
import { Calendar, DateRangePicker } from 'react-date-range';
import { Pane, Popover } from 'evergreen-ui';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default props => {
	const {
		editable = false,
		fieldType,
		filterType = 'date',
		headerStyle = {},
		id,
		onChange,
		onChangeText,
		style = {},
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
							value={value}
							onChange={(field, value) => onChangeText(index, field, value)}
							withTime={true}
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

			return <span>{moment(value).isValid() ? moment(value).format(momentFormat) : null}</span>;
		},
		Filter: ({ onChange }) => {
			if (filterType == 'date') {
				return (
					<Popover
						content={() => (
							<Pane width={332} height={343}>
								<Calendar date={defaultValue} onChange={e => onChange(moment(e).toJSON())} />
							</Pane>
						)}>
						{({ getRef, toggle }) => {
							return (
								<div class="input-group" ref={getRef} style={{ width: '100%' }}>
									{defaultValue && (
										<div
											class="input-group-append"
											onClick={e => onChange('')}
											style={{ cursor: 'pointer' }}>
											<span class="input-group-text">
												<i class="fas fa-times" />
											</span>
										</div>
									)}
									<input
										type="text"
										class="form-control"
										placeholder="Select Date"
										readOnly
										onClick={e => toggle()}
										value={defaultValue ? defaultValue.format('YYYY/MM/DD') : ''}
									/>
									<div
										class="input-group-append"
										onClick={e => toggle()}
										style={{ cursor: 'pointer' }}>
										<span class="input-group-text">
											<i class="fas fa-calendar-alt" />
										</span>
									</div>
								</div>
							);
						}}
					</Popover>
				);
			}

			if (filterType == 'dateRange') {
				return <CustomDateRange defaultValue={defaultValue} filterType={filterType} onChange={onChange} />;
			}

			return null;
		}
	};
};

class CustomDateRange extends Component {
	state = { endDate: false, focusedRange: [0, 0], startDate: false };

	render() {
		const { endDate, focusedRange, startDate } = this.state;
		let { defaultValue, onChange } = this.props;

		if (defaultValue == '') {
			defaultValue = {
				startDate: startDate ? moment(startDate) : false,
				endDate: endDate ? moment(endDate) : false,
				key: 'selection'
			};
		} else {
			if (startDate || endDate) {
				defaultValue = {
					startDate: startDate ? moment(startDate) : false,
					endDate: endDate ? moment(endDate) : false,
					key: 'selection'
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
					endDate: moment(defaultValueEndDate),
					key: 'selection'
				};
			}
		}

		return (
			<Popover
				content={() => (
					<Pane width={560} height={345}>
						<DateRangePicker
							ranges={[defaultValue]}
							onChange={async e => {
								const startDate = moment(e.selection.startDate).toJSON(),
									endDate = moment(e.selection.endDate).toJSON();

								await this.setState({ endDate, startDate });

								if (
									(startDate != '' && endDate != '' && focusedRange[1] == 1) ||
									(startDate != endDate && focusedRange[1] == 0)
								) {
									onChange(`${startDate}*${endDate}`);
								}
							}}
							focusedRange={focusedRange}
							onRangeFocusChange={e => this.setState({ focusedRange: e })}
						/>
					</Pane>
				)}>
				{({ getRef, toggle }) => {
					return (
						<div class="input-group" ref={getRef}>
							{defaultValue.startDate && (
								<div
									class="input-group-append"
									onClick={e => onChange('')}
									style={{ cursor: 'pointer' }}>
									<span class="input-group-text">
										<i class="fa fa-times" aria-hidden="true" />
									</span>
								</div>
							)}
							<input
								type="text"
								class="form-control"
								placeholder="Select Date Range"
								readOnly
								onClick={e => toggle()}
								value={
									defaultValue.startDate
										? `${defaultValue.startDate.format(
												'YYYY/MM/DD'
										  )} - ${defaultValue.endDate.format('YYYY/MM/DD')}`
										: ''
								}
							/>
							<div class="input-group-append" onClick={e => toggle()} style={{ cursor: 'pointer' }}>
								<span class="input-group-text">
									<i class="fa fa-calendar" aria-hidden="true" />
								</span>
							</div>
						</div>
					);
				}}
			</Popover>
		);
	}
}
