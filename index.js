import React, { Component } from 'react';
import moment from 'moment-timezone';
import InputDate from '@volenday/input-date';
import { Formik } from 'formik';
import { DatePicker } from 'antd';

import './styles.css';

export default props => {
	const {
		editable = false,
		fieldType,
		filterType = 'dateRange',
		timezone = 'auto',
		id,
		onChange,
		width,
		...defaultProps
	} = props;

	let momentFormat = 'MMMM DD, YYYY';
	switch (fieldType) {
		case 'datetime':
			momentFormat = 'MMMM DD, YYYY hh:mm A';
			break;
		case 'time':
			momentFormat = 'hh:mm A';
			break;
	}

	return {
		...defaultProps,
		minWidth: 250,
		width,
		Cell: ({ row: { original }, value }) => {
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
							<InputDate
								id={id}
								value={
									timezone === 'auto'
										? values[id]
										: moment(values[id]).utc().tz(timezone).format(momentFormat)
								}
								onOk={submitForm}
								timezone={timezone}
								onChange={handleChange}
								styles={{ width: '100%' }}
								withTime={fieldType == 'datetime' || fieldType == 'time' ? true : false}
							/>
						)}
					</Formik>
				);
			}

			return (
				<span>
					{moment(value).isValid()
						? timezone === 'auto'
							? moment(value).format(momentFormat)
							: moment(value).utc().tz(timezone).format(momentFormat)
						: null}
				</span>
			);
		},
		Filter: ({ column: { filterValue = '', setFilter } }) => {
			if (filterValue === '') {
				if (filterType == 'date') filterValue = null;
			}

			if (typeof filterValue === 'string') {
				if (filterType === 'date') {
					if (filterValue) filterValue = moment(filterValue);
				}
			}

			if (filterType == 'date')
				return <DatePicker onChange={e => setFilter(e ? e.toJSON() : '')} value={filterValue} />;

			if (filterType == 'dateRange') return <CustomDateRange value={filterValue} setFilter={setFilter} />;

			return null;
		}
	};
};

class CustomDateRange extends Component {
	state = { endDate: false, startDate: false };

	render() {
		const { endDate, startDate } = this.state;
		let { setFilter, value } = this.props;

		if (value === '') {
			value = {
				startDate: startDate ? moment(startDate) : false,
				endDate: endDate ? moment(endDate) : false
			};
		} else {
			if (startDate || endDate)
				value = {
					startDate: startDate ? moment(startDate) : false,
					endDate: endDate ? moment(endDate) : false
				};
		}

		if (typeof value === 'string') {
			if (value.includes('*')) {
				const valueSplit = value.split('*'),
					valueStartDate = valueSplit[0],
					valueEndDate = valueSplit[1];
				value = {
					startDate: moment(valueStartDate),
					endDate: moment(valueEndDate)
				};
			}
		}

		return (
			<DatePicker.RangePicker
				onChange={async e => {
					if (e.length === 0) return setFilter('');

					const [start, end] = e;
					const startDate = start.toJSON(),
						endDate = end.toJSON();

					await this.setState({ endDate, startDate });
					setFilter(`${startDate}*${endDate}`);
				}}
				value={[value.startDate, value.endDate]}
			/>
		);
	}
}
