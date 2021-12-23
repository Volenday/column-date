import React, { memo, Suspense, useRef, useState } from 'react';
import moment from 'moment-timezone';
import { Skeleton } from 'antd';

import './styles.css';

import Filter from './filter';

const browser = typeof process.browser !== 'undefined' ? process.browser : true;

const ColumnDate = ({
	editable = false,
	fieldType,
	filterType = 'dateRange',
	timezone = 'auto',
	id,
	list = [],
	loading = false,
	onChange,
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
		Cell: props =>
			browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Cell
						{...props}
						other={{ editable, fieldType, id, momentFormat, onChange, styles: { width: '100%' }, timezone }}
					/>
				</Suspense>
			) : null,
		Filter: props =>
			browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Filter {...props} id={id} list={list} loading={loading} />
				</Suspense>
			) : null
	};
};

const Cell = memo(
	({ other: { editable, fieldType, id, momentFormat, onChange, styles, timezone }, row: { original }, value }) => {
		if (typeof value == 'undefined') return null;

		if (editable) {
			const { Controller, useForm } = require('react-hook-form');
			const InputDate = require('@volenday/input-date').default;
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
										timezone === 'auto' || timezone === 'off'
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
					? timezone === 'auto' || timezone === 'off'
						? moment(value).format(momentFormat)
						: moment(value).utc().tz(timezone).format(momentFormat)
					: null}
			</span>
		);
	}
);

export default ColumnDate;
