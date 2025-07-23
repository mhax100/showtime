const { convertSerpTimeToISO } = require('../../showtimes-api')

describe('convertSerpTimeToISO', () => {
  test('returns a valid ISO string', () => {
    const result = convertSerpTimeToISO('5:00pm', 'TodayJul 8')
    console.log(result)
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
  })

  test('converts AM/PM correctly', () => {
    const amResult = convertSerpTimeToISO('9:30am', 'TodayJul 8')
    const pmResult = convertSerpTimeToISO('9:30pm', 'TodayJul 8')
    
    const amDate = new Date(amResult)
    const pmDate = new Date(pmResult)
    
    // PM should be 12 hours later than AM
    expect(pmDate.getTime() - amDate.getTime()).toBe(12 * 60 * 60 * 1000)
  })

  test('handles midnight correctly', () => {
    const result = convertSerpTimeToISO('12:00am', 'TodayJul 8')
    const date = new Date(result)
    expect(date.getHours()).toBe(0)
  })

  test('handles noon correctly', () => {
    const result = convertSerpTimeToISO('12:00pm', 'TodayJul 8')
    const date = new Date(result)
    expect(date.getHours()).toBe(12)
  })

  test('preserves minutes', () => {
    const result = convertSerpTimeToISO('2:45pm', 'TodayJul 8')
    const date = new Date(result)
    expect(date.getMinutes()).toBe(45)
  })

  test('handles further dates correctly', () => {
    const result = convertSerpTimeToISO('1:00pm', 'SatJul 12')
    const date = new Date(result)
    expect(date.getMinutes()).toBe(0)
    expect(date.getHours()).toBe(13)
    expect(date.getDay()).toBe(6)
  })
})