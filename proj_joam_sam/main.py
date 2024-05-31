import torch
import torchvision
from dataset import PennFudanDataset, get_transform  # Adjusted import
import utils


def train():
    model = torchvision.models.detection.fasterrcnn_resnet50_fpn(
        weights="DEFAULT")
    dataset = PennFudanDataset('data/PennFudanPed', get_transform(train=True))
    data_loader = torch.utils.data.DataLoader(
        dataset,
        batch_size=2,
        shuffle=True,
        num_workers=4,
        collate_fn=utils.collate_fn
    )

    # For Training
    images, targets = next(iter(data_loader))
    images = list(image for image in images)
    targets = [{k: v for k, v in t.items()} for t in targets]
    output = model(images, targets)  # Returns losses and detections
    print(output)

    # For inference
    model.eval()
    x = [torch.rand(3, 300, 400), torch.rand(3, 500, 400
