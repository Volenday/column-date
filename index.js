import React, { memo, Suspense, useRef, useState } from 'react';
import moment from 'moment-timezone';
import InputDate from '@volenday/input-date';
import { Controller, useForm } from 'react-hook-form';
import { DatePicker, Skeleton } from 'antd';

import './styles.css';

export default ({
	editable = false,
	fieldType,
	filterType = 'dateRange',
	timezone = 'auto',
	id,
	onChange,
	width,
	...defaultProps
}) => {
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
		Cell: props => (
			<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
				<Cell
					{...props}
					other={{ editable, fieldType, id, momentFormat, onChange, styles: { width: '100%' }, timezone }}
				/>
			</Suspense>
		),
		Filter: props => (
			<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
				<Filter {...props} other={{ filterType }} />
			</Suspense>
		)
	};
};

const Cell = memo(
	({ other: { editable, fieldType, id, momentFormat, onChange, styles, timezone }, row: { original }, value }) => {
		if (typeof value == 'undefined') return null;

		if (editable) {
			const formRef = useRef();
			const originalValue = value;
			const { control, handleSubmit } = useForm({ defaultValues: { [id]: value } });

			const submit = data => onChange({ ...data, Id: original.Id });

			return (
				<form onSubmit={handleSubmit(submit)} ref={formRef} style={styles}>
					<Controller
						control={control}
						name={id}
						render={({ name, onChange, value }) => {
							return (
								<InputDate
									id={name}
									onChange={e => {
										onChange(e.target.value);
										originalValue !== value &&
											formRef.current.dispatchEvent(new Event('submit', { cancelable: true }));
									}}
									onOk={() =>
										originalValue !== value &&
										formRef.current.dispatchEvent(new Event('submit', { cancelable: true }))
									}
									timezone={timezone}
									value={
										timezone === 'auto'
											? value
											: moment(value).utc().tz(timezone).format(momentFormat)
									}
									withTime={fieldType == 'datetime' || fieldType == 'time' ? true : false}
								/>
							);
						}}
					/>
				</form>
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
	}
);

const CustomDateRange = memo(({ setFilter, value }) => {
	const [endDate, setEndDate] = useState(false);
	const [startDate, setStartDate] = useState(false);

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
				const sd = start.toJSON(),
					ed = end.toJSON();

				setEndDate(ed);
				setStartDate(sd);
				setFilter(`${sd}*${ed}`);
			}}
			value={[value.startDate, value.endDate]}
		/>
	);
});

const Filter = memo(({ column: { filterValue = '', setFilter }, other: { filterType } }) => {
	if (filterValue === '') {
		if (filterType == 'date') filterValue = null;
	}

	if (typeof filterValue === 'string') {
		if (filterType === 'date') {
			if (filterValue) filterValue = moment(filterValue);
		}
	}

	if (filterType == 'date') return <DatePicker onChange={e => setFilter(e ? e.toJSON() : '')} value={filterValue} />;

	if (filterType == 'dateRange') return <CustomDateRange value={filterValue} setFilter={setFilter} />;

	return null;
});
