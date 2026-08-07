import ProfileController from './ProfileController'
import InventoryValuationController from './InventoryValuationController'
import SecurityController from './SecurityController'

const Settings = {
    ProfileController: Object.assign(ProfileController, ProfileController),
    InventoryValuationController: Object.assign(InventoryValuationController, InventoryValuationController),
    SecurityController: Object.assign(SecurityController, SecurityController),
}

export default Settings