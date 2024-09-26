import logging
import os
import sys
from pathlib import Path

import torch
from deoldify import device
from deoldify.device_id import DeviceId
from deoldify.visualize import get_image_colorizer

# Setup logging to include detailed logs (INFO level or higher)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

# Log the device selection
logging.info("Setting up the device for colorization...")

# Ensure GPU usage if available
device.set(device=DeviceId.GPU0)

# Log model loading
logging.info("Loading the DeOldify model...")
colorizer = get_image_colorizer(artistic=False)


def colorize_image(input_path: str, output_dir: str):
    input_path = Path(input_path)
    output_dir = Path(output_dir)

    # Check if input image exists
    logging.info(f"Checking if input image '{input_path}' exists...")
    if not input_path.exists() or not input_path.is_file():
        logging.error(
            f"Error: File '{input_path}' does not exist or is not a valid file."
        )
        sys.exit(1)

    # Ensure the output directory exists
    logging.info(f"Ensuring that the output directory '{output_dir}' exists...")
    if not output_dir.exists():
        try:
            output_dir.mkdir(parents=True, exist_ok=True)
            logging.info(f"Created output directory: {output_dir}")
        except Exception as e:
            logging.error(
                f"Error: Unable to create output directory '{output_dir}'. {e}"
            )
            sys.exit(1)

    # Log the start of the colorization process
    logging.info(
        f"Starting colorization for '{input_path}' with output to '{output_dir}'..."
    )

    # Perform colorization and save the result
    try:
        colorizer.plot_transformed_image(
            path=str(input_path),
            render_factor=35,
            results_dir=output_dir,  # Keep the Path object directly
            watermarked=False,
        )
        logging.info(f"Image colorized and saved to {output_dir}")
    except Exception as e:
        logging.error(f"Error during colorization: {e}")
        sys.exit(1)


if __name__ == "__main__":
    # Log script start
    logging.info("Starting the colorization script...")

    if len(sys.argv) < 3:
        logging.error("Usage: python colorize.py <input_image_path> <output_image_dir>")
        sys.exit(1)

    input_image_path = sys.argv[1]
    output_image_dir = sys.argv[2]

    # Log input parameters
    logging.info(f"Input image path: {input_image_path}")
    logging.info(f"Output image directory: {output_image_dir}")

    # Start colorization
    colorize_image(input_image_path, output_image_dir)
