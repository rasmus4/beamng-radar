local M = {}

local function onVehicleSwitched(_, _, _)
    guihooks.trigger("_Radar_VehicleSwitch")
end

M.onVehicleSwitched = onVehicleSwitched

return M
