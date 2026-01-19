import { Checkbox } from '@/components/ui'
import { useBoardStore } from '@/store'
import { REGIONS, REGION_LABELS, type Region } from '@/types'

export function RegionSelector() {
  const { selectedRegions, toggleRegion } = useBoardStore()

  return (
    <div className="space-y-3">
      <h3 className="font-pixel text-xs text-pixel-accent mb-4">Select Regions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {REGIONS.map((region) => (
          <Checkbox
            key={region}
            label={REGION_LABELS[region]}
            checked={selectedRegions.includes(region)}
            onChange={() => toggleRegion(region)}
          />
        ))}
      </div>
      <p className="font-pixel text-[8px] text-gray-500 mt-2">
        {selectedRegions.length} region{selectedRegions.length !== 1 ? 's' : ''} selected
      </p>
    </div>
  )
}
