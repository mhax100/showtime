#!/usr/bin/env node

const pool = require('./database')

async function cleanupExpiredData(standalone = false) {
  const pool = standalone ? require('./database') : require('./database')
  
  try {
    console.log('[CLEANUP] Starting cleanup of expired data...')
    
    // 1. Delete expired events
    console.log('[CLEANUP] 🗓️  Cleaning up expired events...')
    const eventsResult = await pool.query(
      `DELETE FROM events 
       WHERE expires_at < NOW() 
       RETURNING id, title, expires_at`
    )
    
    const eventsDeleted = eventsResult.rows.length
    if (eventsDeleted > 0) {
      console.log(`[CLEANUP] ✅ Deleted ${eventsDeleted} expired event(s):`)
      eventsResult.rows.forEach(event => {
        console.log(`[CLEANUP]   - ${event.title} (${event.id}) - expired: ${event.expires_at}`)
      })
      console.log('[CLEANUP] ✅ Related data automatically cleaned up via CASCADE DELETE')
    } else {
      console.log('[CLEANUP] ℹ️  No expired events found')
    }
    
    // 2. Delete expired SerpAPI cache entries
    console.log('[CLEANUP] 🗂️  Cleaning up expired SerpAPI cache...')
    const cacheResult = await pool.query(
      `DELETE FROM serpapi_cache 
       WHERE expires_at < NOW() 
       RETURNING location, movie, expires_at`
    )
    
    const cacheDeleted = cacheResult.rows.length
    if (cacheDeleted > 0) {
      console.log(`[CLEANUP] ✅ Deleted ${cacheDeleted} expired cache entrie(s):`)
      cacheResult.rows.forEach(cache => {
        console.log(`[CLEANUP]   - ${cache.movie} in ${cache.location} - expired: ${cache.expires_at}`)
      })
    } else {
      console.log('[CLEANUP] ℹ️  No expired cache entries found')
    }
    
    // Show remaining counts
    const eventsCount = await pool.query('SELECT COUNT(*) as count FROM events')
    const cacheCount = await pool.query('SELECT COUNT(*) as count FROM serpapi_cache')
    
    console.log('[CLEANUP] 📊 Summary:')
    console.log(`[CLEANUP]   - Remaining events: ${eventsCount.rows[0].count}`)
    console.log(`[CLEANUP]   - Remaining cache entries: ${cacheCount.rows[0].count}`)
    console.log('[CLEANUP] 🏁 Cleanup completed')
    
    return {
      success: true,
      eventsDeleted,
      cacheDeleted,
      remainingEvents: eventsCount.rows[0].count,
      remainingCache: cacheCount.rows[0].count
    }
    
  } catch (error) {
    console.error('[CLEANUP] ❌ Error during cleanup:', error)
    if (standalone) {
      process.exit(1)
    }
    return {
      success: false,
      error: error.message
    }
  } finally {
    if (standalone) {
      await pool.end()
      process.exit(0)
    }
  }
}

// Run if called directly
if (require.main === module) {
  cleanupExpiredData(true)
}

module.exports = { cleanupExpiredData }