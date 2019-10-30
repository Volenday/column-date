import React, { Component, Fragment } from 'react';
import moment from 'moment-timezone';
import InputDate from '@volenday/input-date';
import { Formik } from 'formik';
import { Button, DatePicker } from 'antd';

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
		width,
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
		headerStyle: { ...headerStyle, alignItems: 'center' },
		minWidth: 250,
		style: { ...style, alignItems: 'center', display: 'flex', justifyContent: 'flex-start' },
		width,
		Cell: ({ original, value }) => {
			if (typeof value == 'undefined') return null;

			if (editable) {
				return (
					<Formik
						enableReinitialize={true}
						initialValues={{ [id]: value }}
						onSubmit={values => onChange({ ...values, Id: original.Id })}
						validateOnBlur={false}
						validateOnChange={false}>
						{({ handleChange, submitForm, values }) => (
							<Fragment>
								<InputDate
									id={id}
									value={
										timezone === 'auto'
											? values[id]
											: moment(values[id])
													.utc()
													.tz(timezone)
													.format(momentFormat)
									}
									timezone={timezone}
									onChange={handleChange}
									styles={{ minWidth: '86%', width: '90%' }}
									withTime={fieldType == 'datetime' || fieldType == 'time' ? true : false}
								/>
								<Button style={{ width: '10%' }} onClick={submitForm}>
									<i style={{ marginLeft: '-5px' }} class="fas fa-save"></i>
								</Button>
							</Fragment>
						)}
					</Formik>
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
