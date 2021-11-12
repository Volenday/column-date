import React, { memo, Suspense } from 'react';
import moment from 'moment-timezone';
import { Skeleton } from 'antd';

import './styles.css';

import Filter from './filter';

const browser = typeof process.browser !== 'undefined' ? process.browser : true;

const ColumnDate = ({
	fieldType,
	filterType = 'dateRange',
	timezone = 'auto',
	id,
	list = [],
	loading = false,
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
					<Cell {...props} other={{ momentFormat, timezone }} />
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

const Cell = memo(({ other: { momentFormat, timezone }, value }) => {
	if (typeof value === 'undefined') return null;

	return (
		<span>
			{moment(value).isValid()
				? timezone === 'auto' || timezone === 'off'
					? moment(value).format(momentFormat)
					: moment(value)
							.utc()
							.tz(timezone)
							.format(momentFormat)
				: null}
		</span>
	);
});

export default ColumnDate;
