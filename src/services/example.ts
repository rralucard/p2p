/**
 * LocationService 使用示例
 * 
 * 这个文件展示了如何使用LocationService的各种功能
 */

import { locationService } from './LocationService';
import { VenueType } from '../types';

/**
 * 示例：完整的约会地点推荐流程
 */
export async function findDateLocations() {
  try {
    console.log('开始约会地点推荐流程...');

    // 1. 地理编码两个地点
    console.log('步骤1: 地理编码用户输入的地点');
    const location1 = await locationService.geocodeAddress('北京市朝阳区三里屯');
    const location2 = await locationService.geocodeAddress('北京市海淀区中关村');
    
    console.log('地点1:', location1);
    console.log('地点2:', location2);

    // 2. 计算中心点
    console.log('步骤2: 计算两地点的中心位置');
    const midpoint = await locationService.calculateMidpoint(location1, location2);
    console.log('中心点:', midpoint);

    // 3. 搜索附近的约会场所
    console.log('步骤3: 搜索中心点附近的约会场所');
    const venues = await locationService.searchNearbyVenues(
      midpoint,
      [VenueType.RESTAURANT, VenueType.CAFE, VenueType.MOVIE_THEATER],
      3000 // 3km 半径
    );
    
    console.log(`找到 ${venues.length} 个推荐场所:`);
    venues.slice(0, 5).forEach((venue, index) => {
      console.log(`${index + 1}. ${venue.name} - ${venue.address} (距离: ${Math.round(venue.distance)}m)`);
    });

    // 4. 获取第一个场所的详细信息
    if (venues.length > 0) {
      console.log('步骤4: 获取推荐场所的详细信息');
      const detailedVenue = await locationService.getPlaceDetails(venues[0].placeId);
      console.log('详细信息:', {
        name: detailedVenue.name,
        rating: detailedVenue.rating,
        priceLevel: detailedVenue.priceLevel,
        phoneNumber: detailedVenue.phoneNumber,
        website: detailedVenue.website
      });

      // 5. 获取从两个原始地点到推荐场所的路线
      console.log('步骤5: 获取路线信息');
      const directions1 = await locationService.getDirections(location1, detailedVenue.location);
      const directions2 = await locationService.getDirections(location2, detailedVenue.location);
      
      console.log('从地点1到推荐场所:', directions1.distance.text, directions1.duration.text);
      console.log('从地点2到推荐场所:', directions2.distance.text, directions2.duration.text);
    }

    console.log('约会地点推荐流程完成！');
    return venues;

  } catch (error) {
    console.error('推荐流程出错:', error);
    throw error;
  }
}

/**
 * 示例：简单的地点搜索
 */
export async function searchRestaurants(query: string) {
  try {
    console.log(`搜索餐厅: ${query}`);
    
    const places = await locationService.searchPlaces(query);
    console.log(`找到 ${places.length} 个结果:`);
    
    places.forEach((place, index) => {
      console.log(`${index + 1}. ${place.name} - ${place.address}`);
    });
    
    return places;
  } catch (error) {
    console.error('搜索失败:', error);
    throw error;
  }
}

/**
 * 示例：地址地理编码
 */
export async function geocodeExample(address: string) {
  try {
    console.log(`地理编码: ${address}`);
    
    const location = await locationService.geocodeAddress(address);
    console.log('结果:', location);
    
    return location;
  } catch (error) {
    console.error('地理编码失败:', error);
    throw error;
  }
}

// 如果直接运行此文件，执行示例
if (import.meta.env.DEV) {
  // 在开发环境中可以取消注释以下行来测试
  // findDateLocations().catch(console.error);
}