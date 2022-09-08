import React, { memo, Suspense, useRef } from 'react';
import moment from 'moment-timezone';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayjs from 'dayjs';
import reactStringReplace from 'react-string-replace';
import { Skeleton } from 'antd';
import striptags from 'striptags';

import './styles.css';

import Filter from './filter';

const browser = typeof process.browser !== 'undefined' ? process.browser : true;

dayjs.extend(utc);
dayjs.extend(timezone);

const ColumnDate = ({
	editable = false,
	fieldType,
	filterType = 'dateRange',
	timezone = 'auto',
	id,
	list = [],
	loading = false,
	onChange,
	keywords,
	format = null,
	...defaultProps
}) => {
	let momentFormat = 'MMMM DD, YYYY';
	if (format) {
		momentFormat = format;
	} else {
		switch (fieldType) {
			case 'datetime':
				momentFormat = 'MMMM DD, YYYY hh:mm A';
				break;
			case 'time':
				momentFormat = 'hh:mm A';
				break;
		}
	}

	return {
		...defaultProps,
		Cell: props =>
			browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Cell
						{...props}
						other={{
							editable,
							fieldType,
							id,
							momentFormat,
							onChange,
							styles: { width: '100%' },
							timezone,
							keywords
						}}
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

const removeHTMLEntities = (text, multiple) => {
	const elem = multiple ? document.createElement('div') : document.createElement('span');
	return text.replace(/&[#A-Za-z0-9]+;/gi, entity => {
		elem.innerHTML = entity;
		return elem.innerText;
	});
};

const highlightsKeywords = (keywords, stripHTMLTags = false, toConvert, multiple) => {
	const strip = stripHTMLTags ? removeHTMLEntities(striptags(toConvert), multiple) : toConvert;
	const replaceText =
		keywords !== '' ? (
			reactStringReplace(strip, new RegExp('(' + keywords + ')', 'gi'), (match, index) => {
				return multiple ? (
					<div key={`${match}-${index}`} style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>
						{match}
					</div>
				) : (
					<span key={`${match}-${index}`} style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>
						{match}
					</span>
				);
			})
		) : multiple ? (
			<div>{strip}</div>
		) : (
			<span>{strip}</span>
		);

	return replaceText;
};

const Cell = memo(
	({
		other: { editable, fieldType, id, momentFormat, onChange, styles, timezone, keywords },
		row: { original },
		value
	}) => {
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
											: dayjs(value)
													.utc()
													.tz(timezone)
													.format(momentFormat)
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
				{dayjs(value).isValid()
					? timezone === 'auto' || timezone === 'off'
						? highlightsKeywords(keywords, false, dayjs(value).format(momentFormat))
						: highlightsKeywords(
								keywords,
								false,
								dayjs(value)
									.utc()
									.tz(timezone)
									.format(momentFormat)
						  )
					: null}
			</span>
		);
	}
);

export default ColumnDate;
