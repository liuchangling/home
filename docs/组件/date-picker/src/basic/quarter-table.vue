<template>
  <table @click="handleMonthTableClick" @mousemove="handleMouseMove" class="el-month-table">
    <tbody>
    <tr v-for="(row, key) in rows" :key="key">
      <td :class="getCellStyle(cell)" v-for="(cell, key) in row" :key="key">
        <div>
          <a class="cell">{{ getText(cell) }}</a>
        </div>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script type="text/babel">
import Locale from 'element-ui/src/mixins/locale'
import { isDate, range, nextDate } from 'element-ui/src/utils/date-util'
import { hasClass } from 'element-ui/src/utils/dom'
import { arrayFindIndex, coerceTruthyValueToArray, arrayFind } from 'element-ui/src/utils/util'
import dayjs from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
dayjs.extend(quarterOfYear)

// 获取指定年份和季度的所有日期
const datesInYearAndQuarter = (year, quarter) => {
  const numOfDays = getDayCountOfQuarter(year, quarter)
  const firstDay = new Date(year, quarter * 3, 1)
  return range(numOfDays).map(n => nextDate(firstDay, n))
}

// 获取指定年份和季度总天数
const getDayCountOfQuarter = (year, quarter) => {
  switch (quarter) {
    case 0: // 第一季度包含二月，需要对是否闰年进行判断处理
      // 世纪闰年：公历年份是整百数的，必须是400的倍数才是闰年（如1900年不是闰年，2000年是闰年）。
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        return 91
      } else {
        return 90
      }
    case 1:
      return 91
    default:
      return 92
  }
}
const clearDate = (date) => {
  return dayjs(date).startOf('quarter').toDate()
}

const getMonthTimestamp = function(time) {
  if (typeof time === 'number' || typeof time === 'string') {
    return clearDate(new Date(time)).getTime()
  } else if (time instanceof Date) {
    return clearDate(time).getTime()
  } else {
    return NaN
  }
}
export default {
  props: {
    disabledDate: {},
    value: {},
    selectionMode: {
      default: 'month'
    },
    minDate: {},

    maxDate: {},
    defaultValue: {
      validator(val) {
        // null or valid Date Object
        return val === null || isDate(val) || (Array.isArray(val) && val.every(isDate))
      }
    },
    date: {},
    rangeState: {
      default() {
        return {
          endDate: null,
          selecting: false
        }
      }
    }
  },

  mixins: [Locale],

  watch: {
    'rangeState.endDate'(newVal) {
      this.markRange(this.minDate, newVal)
    },

    minDate(newVal, oldVal) {
      if (getMonthTimestamp(newVal) !== getMonthTimestamp(oldVal)) {
        this.markRange(this.minDate, this.maxDate)
      }
    },

    maxDate(newVal, oldVal) {
      if (getMonthTimestamp(newVal) !== getMonthTimestamp(oldVal)) {
        this.markRange(this.minDate, this.maxDate)
      }
    }
  },

  data() {
    return {
      tableRows: [[], []],
      lastRow: null,
      lastColumn: null,
      lastEndDate: null
    }
  },

  methods: {
    cellMatchesDate(cell, date) {
      const value = new Date(date)
      return this.date.getFullYear() === value.getFullYear() && Number(cell.text) === dayjs(value).quarter()
    },
    getCellStyle(cell) {
      const style = {}
      const year = this.date.getFullYear()
      const today = new Date()
      const date = this.parsedValue ? this.parsedValue : today
      const quarter = cell.text
      const defaultValue = this.defaultValue ? Array.isArray(this.defaultValue) ? this.defaultValue : [this.defaultValue] : []
      style.disabled = typeof this.disabledDate === 'function'
        ? datesInYearAndQuarter(year, quarter).every(this.disabledDate)
        : false
      style.current = arrayFindIndex(coerceTruthyValueToArray(this.value), date => date.getFullYear() === year && dayjs(date).quarter() === quarter) >= 0
      style.today = date.getFullYear() === year && dayjs(today).quarter() === quarter
      style.quarter = today.getFullYear() === year && dayjs(today).quarter() === quarter
      style.default = defaultValue.some(date => this.cellMatchesDate(cell, date))

      if (cell.inRange) {
        style['in-range'] = true

        if (cell.start) {
          style['start-date'] = true
        }

        if (cell.end) {
          style['end-date'] = true
        }
      }
      return style
    },
    getQuarterOfCell(quarter) {
      return dayjs(this.date).startOf('year').add(quarter, 'quarter').toDate()
    },
    markRange(minDate, maxDate) {
      minDate = getMonthTimestamp(minDate)
      maxDate = getMonthTimestamp(maxDate) || minDate;
      [minDate, maxDate] = [Math.min(minDate, maxDate), Math.max(minDate, maxDate)]
      const rows = this.rows
      for (let i = 0, k = rows.length; i < k; i++) {
        const row = rows[i]
        for (let j = 0, l = row.length; j < l; j++) {
          const cell = row[j]
          const index = i * 2 + j
          const time = this.getQuarterOfCell(index).getTime()

          cell.inRange = minDate && time >= minDate && time <= maxDate
          cell.start = minDate && time === minDate
          cell.end = maxDate && time === maxDate
        }
      }
    },
    handleMouseMove(event) {
      if (!this.rangeState.selecting) return

      let target = event.target
      if (target.tagName === 'A') {
        target = target.parentNode.parentNode
      }
      if (target.tagName === 'DIV') {
        target = target.parentNode
      }
      if (target.tagName !== 'TD') return

      const row = target.parentNode.rowIndex
      const column = target.cellIndex
      // can not select disabled date
      if (this.rows[row][column].disabled) return

      // only update rangeState when mouse moves to a new cell
      // this avoids frequent Date object creation and improves performance
      const endDate = this.getQuarterOfCell(row * 2 + column)
      if (row !== this.lastRow || column !== this.lastColumn || endDate !== this.lastEndDate) {
        this.lastRow = row
        this.lastColumn = column
        this.lastEndDate = endDate
        this.$emit('changerange', {
          minDate: this.minDate,
          maxDate: this.maxDate,
          rangeState: {
            selecting: true,
            endDate: endDate
          }
        })
      }
    },
    handleMonthTableClick(event) {
      let target = event.target
      if (target.tagName === 'A') {
        target = target.parentNode.parentNode
      }
      if (target.tagName === 'DIV') {
        target = target.parentNode
      }
      if (target.tagName !== 'TD') return
      if (hasClass(target, 'disabled')) return
      const column = target.cellIndex
      const row = target.parentNode.rowIndex
      const month = row * 2 + column
      const newDate = this.getQuarterOfCell(month)
      if (this.selectionMode === 'range') {
        if (!this.rangeState.selecting) {
          this.$emit('pick', { minDate: this.getQuarterStart(newDate), maxDate: null })
          this.rangeState.selecting = true
        } else {
          if (newDate >= this.minDate) {
            this.$emit('pick', { minDate: this.getQuarterStart(this.minDate), maxDate: this.getQuarterEnd(newDate) })
          } else {
            this.$emit('pick', { minDate: this.getQuarterStart(newDate), maxDate: this.getQuarterEnd(this.minDate) })
          }
          this.rangeState.selecting = false
        }
      } else {
        this.$emit('pick', month)
      }
    },
    getQuarterStart(date) {
      return dayjs(date).startOf('quarter').toDate()
    },
    getQuarterEnd(date) {
      return dayjs(date).endOf('quarter').toDate()
    },
    getText(cell) {
      const idx = cell.text
      if (idx === 0) return '第一季度'
      if (idx === 1) return '第二季度'
      if (idx === 2) return '第三季度'
      if (idx === 3) return '第四季度'
      return ''
    }
  },

  computed: {
    rows() {
      // TODO: refactory rows / getCellClasses
      const rows = this.tableRows
      const disabledDate = this.disabledDate
      const selectedDate = []
      const now = getMonthTimestamp(new Date())

      for (let i = 0; i < 2; i++) {
        const row = rows[i]
        for (let j = 0; j < 2; j++) {
          let cell = row[j]
          if (!cell) {
            cell = { row: i, column: j, type: 'normal', inRange: false, start: false, end: false }
          }

          cell.type = 'normal'

          const index = i * 2 + j
          const time = this.getQuarterOfCell(index).getTime()
          cell.inRange = time >= getMonthTimestamp(this.minDate) && time <= getMonthTimestamp(this.maxDate)
          cell.start = this.minDate && time === getMonthTimestamp(this.minDate)
          cell.end = this.maxDate && time === getMonthTimestamp(this.maxDate)
          const isToday = time === now

          if (isToday) {
            cell.type = 'today'
          }
          cell.text = index
          const cellDate = new Date(time)
          cell.disabled = typeof disabledDate === 'function' && disabledDate(cellDate)
          cell.selected = arrayFind(selectedDate, date => date.getTime() === cellDate.getTime())

          this.$set(row, j, cell)
        }
      }
      return rows
    }
  }
}
</script>
